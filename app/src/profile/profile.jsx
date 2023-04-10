import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import './profile.css'
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';
// export function Profile(props) {
//     const Authenticated = props.Authenticated;
//     const [userData, setUserData] = useState(null);

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