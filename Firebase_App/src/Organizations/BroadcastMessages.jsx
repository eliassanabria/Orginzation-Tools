import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthState } from '../authentication/login/AuthState';

const BroadcastMessage = (props) => {
    const groupID = props.groupID;
    const authState = props.authState;
    const close = props.close;
    const socket = props.socket;
    const [addToAnnouncements, setAddToAnnouncements] = useState(false);
    const [expires, setExpires] = useState('');

    const [scopes, setScopes] = useState([]);
    const [selectedScope, setSelectedScope] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        async function fetchScopes() {
            try {
                const response = await axios.get('API_URL_HERE');
                setScopes([{ label: 'Organization Wide', id: 'org-wide' }]);
//                setScopes([{ label: 'Organization Wide', id: 'org-wide' }, ...response.data]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchScopes();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            scope: selectedScope,
            title,
            body,
            addToAnnouncements,
            expires: addToAnnouncements ? expires : null,
        };
        // Submit the form data here
        socket.sendAnnouncement(groupID, formData.scope,formData.title, formData.body, formData.addToAnnouncements, formData.expires);
        console.log(formData);
        close();
    };

    return (
        <div className="container">
            <h1 className="my-4">Broadcast Message</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="scope" className="form-label">Scope</label>
                    <select
                        className="form-select"
                        id="scope"
                        value={selectedScope}
                        onChange={(e) => setSelectedScope(e.target.value)}
                        required
                    >
                        <option value="">Select a scope</option>
                        {scopes.map((scope) => (
                            <option key={scope.id} value={scope.id}>
                                {scope.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="body" className="form-label">Body</label>
                    <textarea
                        className="form-control"
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="addToAnnouncements"
                    checked={addToAnnouncements}
                    onChange={(e) => setAddToAnnouncements(e.target.checked)}
                />
                <label htmlFor="addToAnnouncements" className="form-check-label">Add This broadcast to announcements</label>
            </div>

            {addToAnnouncements && (
                <div className="mb-3">
                    <label htmlFor="expires" className="form-label">Expires</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        id="expires"
                        value={expires}
                        onChange={(e) => setExpires(e.target.value)}
                        required
                    />
                </div>
            )}
                <button type="submit" className="btn btn-primary" style={{marginRight:'80px'}} disabled = {authState!==AuthState.Authenticated}>Send</button>
                <button className='btn btn-secondary' onClick={close}>Close</button>
            </form>
            <p>Adding too many announcements can clutter the dashboard.</p>
            <p>Broadcasts will be sent to all users online, and offline with push notifications.</p>
        </div>
    );
};

export default BroadcastMessage;
