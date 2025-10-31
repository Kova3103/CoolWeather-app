# Prerequisites:
+ Java 17+: For the backend (Spring Boot).
+ Maven: To build the backend (included with Spring Boot or install via https://maven.apache.org/).
+ Node.js 18+ and npm: For the frontend (React) - download from https://nodejs.org/.
+ Git: To clone the repository (install from https://git-scm.com/).

If the API key does not work for some reason:
OpenWeatherMap API Key: Sign up at https://openweathermap.org/api, generate a free key, and add it to (replace the current one) backend/src/main/resources/application.properties.


## Installation:
Open Visual Studio Code (The official download link for Visual Studio Code (VS Code) is: https://code.visualstudio.com/download)

Open two Powershell terminals and run this code to clone the repository and navigate to it:
+ git clone https://github.com/Kova3103/CoolWeather-app.git
+ cd CoolWeather-app

In one terminal setup the backend:
+ cd backend
+ mvn clean install

In other terminal setup the frontend:
+ cd frontend 
+ npm install


## How to run backend:
Run this code: mvn spring-boot:run

## How to run frontend:
Run this code: 
+ npm start

You might get this error message (due to powershell being set to restrictive to prevent malicious npm calls): npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system. For more information, see 
about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
At line:1 char:1
+ npm start
+ ~~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess

Our node.js npm call is not malicious so to prevent this issue run this code: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Then once again run: 
+ npm start
The frontend will automatically go to port 3001 as 3000 is already in use so just confirm it with "Y"
