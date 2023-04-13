import React, { useState, useEffect } from 'react';
import './loaderContainer.css'
const Spinner = (props) => {
    const Action = props.action;
    const Messgae = props.message;
    return (
        <div>
            <div class="popup">
                <div class="popup-inner">
                    <table class='loader'>
                        <tr>
                            <td>
                            <div class="spinner-holder">
                        <div class="lds-spinner">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                            </td>
                            <td>
                            {Action}
                            </td>
                        </tr>
                        <tr>
                            {Messgae}
                        </tr>
                    </table>
                </div>
            </div>
        </div>






    )
}
export { Spinner }