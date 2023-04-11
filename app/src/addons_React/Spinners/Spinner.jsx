import React, { useState, useEffect } from 'react';
import './loaderContainer.css'
const Spinner = () => {
    return (
        <div>
            <div class="popup">
                <div class="popup-inner">
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
                </div>
            </div>
        </div>







    )
}
export { Spinner }