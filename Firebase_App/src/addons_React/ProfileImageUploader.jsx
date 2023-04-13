import React, { useRef } from 'react';


//This function is used to upload a file passed by a component like registering
const uploadUserImage = async (file)=>{
    async function getS3URLPresign(endpoint, contentType, contentLength) {
        const response = await fetch(endpoint, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                Content_Type: contentType,
                contentLength: contentLength
            })
        });
        return response;
    }
    const contentType = file.type;
        var signedUrl;
        const response = await getS3URLPresign('/api/services/uploads/profiles', contentType, file.size);
        if (response.status !== 200) {
            const body = response.json();
            alert(`⚠ Error: ${body.msg}`);
        }
        else {
            const body = await response.json();
            signedUrl = body.url;
        }
        // Replace this with the actual signed URL from your server
        //const signedUrl = 'your_signed_url_here';

        //await put(signedUrl,file);
        //Fetch put method file to S3
        const response2 = await fetch((signedUrl), {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': contentType
            },
        })
        if (response2.status === 200) {
            //update Users image url on mongo and locally.
            const newURL = signedUrl.split('?')[0];
            const changeURLResponse = await fetch('/api/services/updateImageURL', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-type': 'application/json; charset=UTF-8',
                },
                body:JSON.stringify({url:newURL})
            })
            if(changeURLResponse.status === 200){
                localStorage.setItem('profile_image_url',newURL);

            }
        }
}

const FileUpload = () => {
    const fileInputRef = useRef();
    async function getS3URLPresign(endpoint, contentType, contentLength) {
        const response = await fetch(endpoint, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                Content_Type: contentType,
                contentLength: contentLength
            })
        });
        return response;
    }
    const handleUpload = async () => {
        if (fileInputRef.current.files.length > 0) {
            const file = fileInputRef.current.files[0];
            const contentType = file.type;
            var signedUrl;
            const response = await getS3URLPresign('/api/services/uploads/profiles', contentType, file.size);
            if (response.status !== 200) {
                const body = response.json();
                alert(`⚠ Error: ${body.msg}`);
            }
            else {
                const body = await response.json();
                signedUrl = body.url;
            }
            // Replace this with the actual signed URL from your server
            //const signedUrl = 'your_signed_url_here';

            //await put(signedUrl,file);
            //Fetch put method file to S3
            const response2 = await fetch((signedUrl), {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': contentType
                },
            })
            if (response2.status === 200) {
                //update Users image url on mongo and locally.
                const newURL = signedUrl.split('?')[0];
                const changeURLResponse = await fetch('/api/services/updateImageURL', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                    body:JSON.stringify({url:newURL})
                })
                if(changeURLResponse.status === 200){
                    localStorage.setItem('profile_image_url',newURL);

                }
            }
        } else {
            console.log('Please select a file');
        }
    };



    return (
        <div>
            <input type="file" ref={fileInputRef} accept="image/png, image/jpeg" />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export { FileUpload, uploadUserImage };
