import React from "react";
import './404.css';


export function NotFound(){
    return(
    <div id='Er404'>
             <div class="mainbox">
    <div class="err">4</div>
    <i class="far fa-question-circle fa-spin"></i>
    <div class="err2">4</div>
    <div class="msg"> Got deleted? Maybe this page moved? Is hiding out in quarantine? Never existed in the first place?<p>Let's go <a href="/home">home</a> and try from there.</p></div>
      </div>
    </div>);
}