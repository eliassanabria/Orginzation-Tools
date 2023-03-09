# Orginzation-Tools
Backups of my code for Organization Tools and YSA Tools Application that is being built.
# Purpose:
Organizations can struggle to communicate and get messages out, with the creation of Organization Tools, messages can be sent to people within an organization.
The creation of YSA Tools will utilize the Organization Tools Base code but will allow YSA Wards to communicate with each other, and know what apartments are in the ward as well as who lives in what apartment.

# Startup Application:
### Pitch:
Organization Tools will be a long-term project with expansions into various different applications.
For the startup application that will be used in CS 260, the sub-application will be geared towards church wards from the Church of Jesus Christ of Latter-day Saints. Particularly Singles wards (YSA and SA Wards) to help members get to know each other and communicate with each other.

### Key Features with CS 260 requirements:
YSA Tools will focus on:
* Ward Directory
* Online status / last seen
* ~~Direct chat messages~~
* Browser push notifications 

### Key Features Long-Term (Post CS 260):
* SMS Broadcasting Polls (Send text messages with response polls)
* Text message and email address verification for account recovery
* Birthday List Generation
* Ward Notifications
* Ward Calendars
* Group Chats
* Assignment Delegation for members with callings

* Ward Registrations / Subscription Based Access
  * Free Plan
  * Basic Plan
  * Premium Plan
* Account Migration to other YSA Wards
* Account Management to other Organization Tools Applications like business organizations and school planners.

##### Disclaimer:
Applications that are used by church organizations is not supported nor endorsed by the Church of Jesus Christ of Latter-Day Saints.


#### Server Info:
IP address: 3.12.0.248

URL: https://organizationtools.org

## Goals:
Have subdomains for different organizations that use the application. Potentially for businesses, have them integrate their own Single Sign-on for select applications.


# Notes:
## HTML:

* Structure: HTML is structured using tags and elements
* Input: The < input > element is used to create form controls like text boxes, checkboxes, radio buttons, etc.
* Media: HTML5 introduced < audio > and < video > elements for playing audio and video on web pages.
## CSS:

* Selectors: CSS selectors are used to select HTML elements based on their id, class, or tag.
* Declarations: CSS declarations are used to specify the style of the selected elements.
* Fonts: CSS provides several properties for customizing fonts including font-family, font-size, font-style, font-weight, and text-transform.
* Animations: CSS animations can be created using keyframes, transitions, and animations.
* Responsiveness: CSS media queries can be used to make web pages responsive to different screen sizes.
* Grids and Flex: CSS Grid and Flexbox are two layout models used in CSS for creating complex web layouts.
## JavaScript:

* Functions: Functions are reusable blocks of code that can take parameters and return values.
* Arrow Functions: Arrow functions are a concise syntax for creating functions that use the "=>" operator.
* Arrays: Arrays are used to store multiple values in a single variable.
* Objects: Objects are used to store collections of key-value pairs.
* Classes: Classes are a way to create reusable object blueprints in JavaScript.
* Regular Expressions: Regular expressions are used to match patterns in strings.
* Rest and Spread: Rest and Spread operators are used to manipulate arrays and objects.
* Destructuring: Destructuring is a way to extract values from arrays and objects.
* Expressions: Expressions are any valid unit of code that can be evaluated to a value.
* DOM: The Document Object Model (DOM) is a programming interface for HTML and XML documents.
* Promises: Promises are used for asynchronous programming in JavaScript.
* Async/Await: Async/Await is a syntax for writing asynchronous code that looks like synchronous code.



# Logs:
### 1 March 2023
Bug fixes in html footer elements causing footer to not sink to bottom of browser. I have also implemented a small amount of JavaScript to call an api to get fake user data to populate the directory. Progress has also been made on the transition of the React Application version.

### 23 February 2023
I have removed driect chat messages from the startup specs temporarily to reduce the amout of time it will take to code what has been done so far.
The startup has been made progress. However to further accelerate the startup, I will now begin to play with React a little so since this application will need room to expand and grow into multiple directions.

### 1 February 2023
Drop-down status updates and remains if mobile device rotates.
Status Changes cause status light to change with JS.
Login and Registration Authentication are stored on local device until services are written.
Footer is now on both login and directory screens.
I added some JS and used local storage to facilitate mocking authentication process until the service is written. I also changed the media queries to determine which type of navigation bar is needed at the top of the page. A collapable one for mobile device screens and full naviagtion bar for desktop users.
