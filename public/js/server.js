class serverObject {
   constructor({}) {
      this.activeRequests = {};

      const server = this;
      window.addEventListener("load", (event) => {
         document.getElementById("login-submit").addEventListener("click", function () {
            server.submitLogin();
         });
      });
   }

   async sendRequest({
      sendData,
      url,
      successToastTitle,
      successToastMessage,
      errorToast,
      permissionToast,
      accessToast,
   }) {
      let request = new serverRequest({
         sendData,
         url,
         successToastTitle,
         successToastMessage,
         errorToast,
         permissionToast,
         accessToast,
         server: this,
      });
      this.addRequest({ request });

      try {
         const response = await request.send();
         return response;
      } catch (error) {
         return { status: "error" };
      }
   }

   addRequest({ request }) {
      this.activeRequests[request.id] = request;
   }

   clearRequest({ id }) {
      delete this.activeRequests[id];
   }

   getRequest({ id }) {
      return this.activeRequests[id];
   }

   async submitLogin() {
      const email = $(`#log-in-username`).val().trim();
      const password = $(`#log-in-password`).val().trim();
      const requestId = $(`#ajax-request-id`).val().trim();
      let request = new serverRequest({
         sendData: { email, password },
         url: "ajaxLogin",
         server: this,
      });
      this.addRequest({ request });
      const response = await request.send();
      if (response.status == "success") {
         closeModal("login");
         //Update csrf token
         document.querySelector('meta[name="csrf-token"]').setAttribute("content", response.csrf);
         document.cookie = `_csrf=${response.csrf}`;

         const request = this.getRequest({ id: requestId });
         return request.sessionReceived();
      }
      //Add error message
      if (response.message == fail) {
         $(`#log-in-message .error-notice`).html(`Login failed. Please try again`);
      } else {
         $(`#log-in-message .error-notice`).html(`Your account has been locked`);
      }
   }
}

class serverRequest {
   constructor({
      sendData,
      url,
      successToastTitle,
      successToastMessage,
      errorToast,
      permissionToast,
      accessToast,
      server,
   }) {
      this.sendData = sendData;
      this.url = window.location.protocol + "//" + window.location.host + "/" + url;
      this.successToastTitle = successToastTitle;
      this.successToastMessage = successToastMessage;
      this.errorToast = errorToast;
      this.permissionToast = permissionToast;
      this.accessToast = accessToast;
      this.id = Math.floor(Math.random() * 99999999);
      this.server = server;

      this.headers = {
         "Content-Type": "application/json",
         Accept: "application/json",
      };
   }

   updateCsrfHeader() {
      //Add csrf token if available
      try {
         this.headers["X-CSRF-Token"] = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
      } catch (error) {}
   }

   send() {
      const request = this;
      return new Promise(async function (resolve, reject) {
         //Send AJAX request
         try {
            request.updateCsrfHeader();

            let response = await fetch(request.url, {
               method: "POST",
               headers: request.headers,
               body: JSON.stringify(request.sendData),
            });

            //Handle network errors
            if (!response.ok) {
               //Invalid url
               if (response.status == 404) {
                  console.log(`404 error`);
                  throw new Error(404);
               }

               //CSRF token
               if (response.status == 403) {
                  console.log(`403 error`);
                  throw new Error(403);
               }
               console.log(response);
               throw new Error("other");
            }

            let responseBody;
            try {
               responseBody = await response.json();
            } catch (error) {
               //Handle not logged in (on assumption that server will always return JSON when logged in)
               throw new Error("session");
            }

            //Handle server errors
            if (responseBody.status != "success") {
               throw new Error(responseBody.message ? responseBody.message : "application");
            }

            //Handle successful request
            if (responseBody.status == "success") {
               resolve(responseBody);

               //Clear request from memory
               request.server.clearRequest({ id: request.id });
            }
         } catch (error) {
            console.log(error.message);

            //Send logs
            let logReason = "unknown";
            if (error.message == "session") {
               logReason = "session";
            } else if (error.message == 403) {
               logReason = "csrf";
            } else if (error.message == 404) {
               logReason = 404;
            } else if (error.message == "application") {
               logReason = "application";
            } else {
               logReason = "application";
            }

            if (error) request.sendErrorLog({ error: logReason });

            //Handle not logged in
            if (error.message == "session") request.handleExpiredSession();

            resolve({
               status: "error",
               message: error.message,
            });
         }
      });
   }

   sendErrorLog({ error }) {}

   async handleExpiredSession() {
      $(`#ajax-request-id`).val(this.id);
      $(`#log-in-message .error-notice`).html(`You have been logged out due to inactivity. Please log in again`);
      openModal("login");
      //Get new csrf token whilst the user is typing
      this.requestNewToken();

      //Await session
      await this.getLoggedInSession;

      console.log("new session obtained", "attempt resend");

      //On session received, try resending
      this.send();
   }

   getLoggedInSession = new Promise((resolve, reject) => {
      Object.defineProperty(this, "_sessionReceived", {
         set: (value) => {
            if (value) {
               resolve();
            }
         },
      });
   });

   sessionReceived() {
      this._sessionReceived = true;
   }

   async requestNewToken() {
      let response = await fetch(window.location.protocol + "//" + window.location.host + "/" + "ajaxLoginToken", {
         method: "GET",
         headers: this.headers,
      });

      //Handle network errors
      if (!response.ok) {
         console.log(response);
         return;
      }

      let responseBody = await response.json();
      //Update csrf token
      document.querySelector('meta[name="csrf-token"]').setAttribute("content", responseBody.csrfToken);
      document.cookie = `_csrf=${responseBody.csrfToken}`;
   }
}

const server = new serverObject({});

async function gimmeRestrictedData() {
   const request = await server.sendRequest({
      sendData: {},
      url: "restrictedContent/loadSomething",
   });

   if (request.status == "success") {
      alert(`Success: ${request.data}`);
   } else {
      alert("Authentication failed");
   }
   console.log(request);
}

$(".loadStuff").click(function () {
   gimmeRestrictedData();
});
