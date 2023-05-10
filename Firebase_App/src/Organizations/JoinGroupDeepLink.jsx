import { Spinner } from "../addons_React/Spinners/Spinner";
import { AuthState } from "../authentication/login/AuthState";
import { useParams } from 'react-router-dom'
import React, { useEffect, useState, useContext, useMemo } from 'react';
import JoinGroupPreview from "../home/Popups/GroupJoinPopup";
import PopupAuthenticationPrompt from "../authentication/PopupAuthenticationPrompt";
import '../authentication/AuthPopup.css';

export const JoinDeepLink = (props) => {
    const { joincode } = useParams();
    const { Authenticated } = props;
    const [displayLoader, setLoader] = useState(false);
    const [showGroupPreview, setPreviewStatus] = useState(false);
    const [group_name, set_group_name] = useState('');
    const [group_description, set_group_description] = useState('');
    const [group_creation, set_group_creation] = useState('');
    const [member_count, set_member_count] = useState('');
    const [survey_required, set_survey_required] = useState(false);
    const [survey_id, set_survey_id] = useState('');
    const [owner_name, set_owner_name] = useState('');
    const [owner_contact, set_owner_contact] = useState('');
    const [isNotAuthenticated, setAuthent]= useState(false);
    const closePreview = () => {
        setPreviewStatus(false);
        window.location.href='/home'
      }
    async function getGroupDetails(endpoint) {
        const response = await fetch(endpoint, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response;
    }
    async function joinGroup(endpoint) {
        const response = await fetch(endpoint, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response;
    }

    const JoinGroup = async () => {
        setLoader(true);
        setPreviewStatus(false);
        const response = await joinGroup('/api/groups/join/' + joincode);
        if (response.status !== 200) {
            const body = response.json();
            alert(`⚠ Error: ${body.msg}`);
            setLoader(false);

        }
        else {
            const body = await response.json();
            setLoader(false);

            window.location.href = `/${body.groupID}/directory`;
        }

    }
    useEffect(() => {
        if (Authenticated === AuthState.Authenticated) {
            //show login popup
            makeJoinRequest();
            setAuthent(false);

        }
        else{
            setAuthent(true);
        }
    }, [Authenticated])

    async function makeJoinRequest() {
        setLoader(true);

        //Get group info:
        const groupInfo = await getGroupDetails('/api/group/' + joincode + '/info');
        if (groupInfo.status === 200) {
            const body = await groupInfo.json();
            console.log(body);


            //Group was found, display Group info:
            set_group_name(body.group_name);
            set_group_description(body.group_description);
            set_group_creation(body.group_creation);

            set_member_count(body.member_count);
            set_survey_required(body.survey_required);
            set_survey_id(body.survey_id);
            set_owner_name(body.owner_name);
            set_owner_contact(body.owner_contact);

            setPreviewStatus(true);
            setLoader(false);

        }
        else {
            const body = await groupInfo.json();
            alert(`⚠ Error ${groupInfo.status}: ${body.msg}`);
            setLoader(false);
            if(groupInfo.status === 409){
                window.location.href='/home';
            }
        }
    }
    return (
        <div>
                  {displayLoader && <Spinner/>}

            <h1>
                Request to Join: {joincode}
                {showGroupPreview && <JoinGroupPreview closePreview={closePreview} group_name={group_name} group_description={group_description} group_creation={group_creation} member_count={member_count} owner_name={owner_name} owner_contact={owner_contact} JoinGroup={JoinGroup} />}
                {isNotAuthenticated && (<PopupAuthenticationPrompt/>)}
            </h1>
        </div>
    )
}