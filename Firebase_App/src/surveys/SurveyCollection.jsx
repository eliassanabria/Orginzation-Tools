import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuthState } from '../authentication/login/AuthState'
import { Spinner } from "../addons_React/Spinners/Spinner";

export function SurveyCollection(props) {
  const authState = props.Authenticated;
  const {groupID,surveyID} = useParams();
  const [surveyDocument, setSurveyDocument] = useState(null);
  const[displayLoader, setLoader] = useState(false);
  //handleSubmit
  const handleSubmit = async (event)=>{
    setLoader(true);
    event.preventDefault();
    const form = event.target; // get the form element
    //console.log(form);

    const formData = new FormData(form); // create a new FormData object from the form data
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    
        const submitURL = '/api/' + groupID + '/surveys/' + surveyID + '/submit';    
        const submissionResponse = await fetch(submitURL,{
            method:'post',
            headers:{
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data })
        });

        if (submissionResponse.status !== 200) {
            const responseBody = await submissionResponse.json();
            alert('⚠ Error' + submissionResponse.status + ':' + responseBody.msg);
            setLoader(false);
        } else {
            // Handle successful response
            
            alert('Survey was successfully submitted')
            setLoader(false);
            window.history.back();
        }
            
  }

  useEffect(()=>{
    const form_holder = document.getElementById('form_holder');
    if(authState !== AuthState.Authenticated){
      //form_holder.innerHTML = '<div><b>Please login to continue</b></div>'
    }
    else{
      setLoader(true);
      const apiURL = "/api/" + groupID + "/surveys/" + surveyID;
      fetch(apiURL, {
          headers:{
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }})
      .then(response=>{
          if(response.status!== 200){
              //return;
              setLoader(false);
          }
          else{
              console.log(response);
              return response.json();
          }
      })
      .then(responseBody =>{
          console.log(responseBody);
          setSurveyDocument(responseBody.FormData);
          setLoader(false);
      })
    }
  }, [authState])

  const renderForm = () => {
    if (!surveyDocument) {
      return null;
    }

    return (
      <form onSubmit={handleSubmit}>
        {displayLoader && <Spinner/>}
        <h1>{surveyDocument.document_title}</h1>
        {surveyDocument.survey_questions.map((question) => (
          <div key={question.label}>
            <label htmlFor={question.label}>
              {question.label}
              {question.is_required ? '*' : ''}
            </label>
            {question.type === 'text' ? (
              <input
                type="text"
                name={question.question_id}
                required={question.is_required}
              />
            ) : (
              <select name={question.question_id} required={question.is_required}>
                {question.Options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        <input type="submit" value="Submit" />
      </form>
    );
  };

  return (
    <div>
      {renderForm()}
    </div>
  );
}
