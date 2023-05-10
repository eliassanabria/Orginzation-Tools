import React, { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom'
import { Card } from 'react-bootstrap';

import './profile.css'
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';
import { AuthState } from '../authentication/login/AuthState';
import '../directory/directory.css'
import { Spinner } from '../addons_React/Spinners/Spinner';
import CardHeader from 'react-bootstrap/esm/CardHeader';
export function Profile(props) {
    const { userUUID } = useParams();
    const Authenticated = props.Authenticated;
    const [ErrorMessage, setErrorMessage] = useState(null);
    const [UserPrefName, setUserPrefName] = useState(`User's Preferred name`);
    const [profile_image_url, setUserProfileImage] = useState(`https://cdn-icons-png.flaticon.com/512/456/456212.png`)
    const [userAlias, setAlias] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [displayLoader, setLoader] = useState(false);

    useEffect(() => {
        // if(Authenticated !== AuthState.Authenticated){
        //     return;
        // }
        //Loading
        setLoader(true)
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`/api/users/${userUUID}/profile/public`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if(response.status !==200){
                    const data = await response.json();
                    setErrorMessage(data.msg);
                    return;
                }
                const data = await response.json();
                setUserProfile(data);
                setErrorMessage(null);

            } catch (error) {
                console.error('Error fetching user profile:', error);
                setErrorMessage(error);
            }
        };

        fetchUserProfile();
    }, [Authenticated]);

    if (!userProfile) {
        return (<div>{ErrorMessage && (<div className="alert alert-danger" role="alert">{ErrorMessage}</div>)}
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        </div>);
    }

    const { user, groups, biography, permissions } = userProfile;
    return (

        <div>
            <div>
                {ErrorMessage && (<div className="alert alert-danger" role="alert">{ErrorMessage}</div>)}
                {Authenticated !== AuthState.Authenticated &&
                    <LoginPopupForm targetURL={`./profile`} />
                }
            </div>
            <div className="container">
                <div className="user-info">
                    <img
                        src={user.profileImage}
                        alt={user.name}
                        className="rounded-circle" width="200"
                    />
                    <div className="user-details">
                        <h2>{user.name}</h2>
                        <span>Joined: {user.joinDate}</span>
                        <p className="user-alias">@{user.alias}</p>
                    </div>
                </div>
                <ListGroup className="scrollable-list">
                    <Card.Title><h4>Groups:</h4></Card.Title>
                    {groups.map((group) => (
                        <ListGroupItem key={group.group_uid}>
                            <Link to={`/groups/${group.group_uid}/directory`} className="nav-link">
                                {group.group_name}
                            </Link>
                        </ListGroupItem>
                    ))}
                </ListGroup>
                <div>
                    <Card className='mt-2'>
                        <Card.Body>
                            <Card.Title>Contact Info:</Card.Title>
                            <Card.Text>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">Phone: {user.phone}</li>
                                    <li className="list-group-item">Email: {user.email}</li>
                                    <li className="list-group-item">Direct Message: [Unavaliable]</li>
                                </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                <div>
                    {permissions.CanViewGroupMemberVitals && (<Card className='mt-2'>
                        <Card.Body>
                            <Card.Title>Vitals:</Card.Title>
                            <Card.Text>
                                <ul>
                                    <li>DOB: {user.dob}</li>
                                    <li>Age: {user.age}</li>
                                </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>)}


                    {biography && (<Card className="mt-3">
                        <Card.Body>
                            <Card.Title>Biography</Card.Title>
                            <Card.Text>{biography}</Card.Text>
                        </Card.Body>
                    </Card>)}
                </div>
            </div>
        </div>
    );
}
//     useEffect(() => {
//         // Fetch data from an API and store it in the 'userData' state
//         // For this example, let's use a hardcoded data object
//         const fetchData = async () => {
//             const data = {
//                 profileData: {
//                     name: 'Elias Sanabria',
//                     role: 'Org Tools Founder',
//                     position: 'CEO',
//                     experience: ['Java', 'JavaScript', 'HTML', 'CSS', 'C', 'C++', 'VBA'],
//                     email: 'Admin@organizationtools.org',
//                     website: 'https://organizationtools.org',
//                     phone: '321-345-3976',
//                     imageUrl: 'https://organization-tools-user-profile-images.s3.us-east-2.amazonaws.com/640fc48403548dbecc2d10fa.jpeg',
//                     socialLinks: '',
//                 },
//                 aboutMe: {
//                     // ...
//                 },
//                 skills: [
//                     // ...
//                 ],
//                 education: {
//                     // ...
//                 },
//             };
//             setUserData(data);
//         };

//         fetchData();
//     }, []);

//     return (
//         <div>
//             {userData && (
//                 <UserProfile
//                     profileData={userData.profileData}
//                     aboutMe={userData.aboutMe}
//                     skills={userData.skills}
//                     education={userData.education}
//                 />
//             )}
//         </div>
//     );
// };
// const UserProfile = ({ profileData, aboutMe, skills, education }) => {
//     return (
//         <section className="bg-light">
//             <div className="container">
//                 <div className="row">
//                     <ProfileHeader profileData={profileData} />
//                     <AboutMe aboutMe={aboutMe} />
//                     <Skills skills={skills} />
//                     <Education education={education} />
//                 </div>
//             </div>
//         </section>
//     );
// };

// const ProfileHeader = ({ profileData }) => {
//     const {
//         name,
//         role,
//         position,
//         experience,
//         email,
//         website,
//         phone,
//         imageUrl,
//         socialLinks,
//     } = profileData;
//     return (
//         <div className="col-lg-12 mb-4 mb-sm-5">
//             {/* ... */}
//         </div>
//     );
// };


// const AboutMe = ({ aboutMe }) => {
//     return (
//       <div className="col-lg-12 mb-4 mb-sm-5">
//         <div>
//           <span className="section-title text-primary mb-3 mb-sm-4">About Me</span>
//           {aboutMe.paragraphs.map((text, index) => (
//             <p key={index}>{text}</p>
//           ))}
//         </div>
//       </div>
//     );
//   };


// const Skills = ({ skills }) => {
//     return (
//         <div className="col-lg-12 mb-4 mb-sm-5">
//             {/* ... */}
//         </div>
//     );
// };

// const Education = ({ education }) => {
//     return (
//         <div className="col-lg-12 mb-4 mb-sm-5">
//             {/* ... */}
//         </div>
//     );
// };
// export default Profile;