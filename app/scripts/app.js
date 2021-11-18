document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    var onInit = app.initialized();

    onInit.then(getClient).catch(handleErr);

    function getClient(_client) {
      window.client = _client;
      client.events.on('app.activated', onAppActivate);
    }
  }
};

function onAppActivate() {
  
  var textElement = document.getElementById('apptext');
  var getContact = client.data.get('contact');
  getContact.then(showContact).catch(handleErr);

  function showContact(payload) {
    textElement.innerHTML = `${payload.contact.name}'s personal handyman is here to assist 😍!`;
  }

  /**
  * Opens modal to show bookmarks
  */
  client.interface.trigger('showModal', {
    title: 'Bookmarklet',
    template: './views/bookmarks.html'
  }).then(null, function () {
    client.interface.trigger('showNotify', {
      type: 'error',
      message: 'Some error has occured in \'Start timer app\'.'
    });
  });

  //get 3 sentiment spans from HTML
  const pos = document.getElementById("pos")
  const neg = document.getElementById("neg")
  const neutral = document.getElementById("neutral")

  pos.style.display = "none";
  neg.style.display = "none";
  neutral.style.display = "none";
  
  //fetch sentiment of opened ticket and also fetch attachments
  getCurrentTicket().then(function(currentTicket) {


    getConversationsOfTicket(currentTicket.id).then(function(attachmentsData){
      
      let totalAttachmentsSize = 0;
      document.getElementById("totalAttachments").innerHTML = "<strong>Total Attachments: </strong>" + JSON.parse(attachmentsData).length;

      JSON.parse(attachmentsData).forEach(item => {

        item.attachments.forEach(attachment => {
          let data = {
            'bytes': attachment.size,
            'decimals': 2
          }
          totalAttachmentsSize += attachment.size;
          client.request.invoke("formatBytes", data).then(function(response) {
            displayAttachmentsTable(attachment.name, response.response, attachment.created_at, attachment.attachment_url, attachment.thumb_url, attachment.content_type);
          })
          
        })
      })

      document.getElementById("totalAttachmentsSize").innerHTML = "<strong>Total Attachments Size: </strong>" + totalAttachmentsSize + " bytes";

    })
    
    //call sentiment API
    getSentiment(currentTicket.description_text).then(function(response) {

      const sentimentResponse = JSON.parse(response);
      //parse response into polarity and sentiment and display
      const sentimentPolarity = sentimentResponse.result.polarity;

      if(sentimentPolarity == 0) {
        //neutral
        pos.style.display = "none";
        neg.style.display = "none";
        neutral.style.display = "block";
  
        neutral.innerText = "Customer's sentiment is neutral 🆗 with a score of " + sentimentPolarity
  
      } else if(sentimentPolarity > 0) {
        //positive
        pos.style.display = "block";
        neg.style.display = "none";
        neutral.style.display = "none";
  
        pos.innerText = "Customer's sentiment is positive 😄 with a score of " + sentimentPolarity
      } else {
        //negative
        pos.style.display = "none";
        neg.style.display = "block";
        neutral.style.display = "none";
        
        neg.innerText = "Customer's sentiment is negative 💔 with a score of " + sentimentPolarity  
      }

    }, function(error) {
      console.log("error with sentiment api" + JSON.stringify(error))
    })
    
  })

  //fetch bookmarked tickets
  displayBookmarkedTickets();

  //Store Recently Viewed
  recentlyViewed();
}

/**
 * Function to display the attachments in a table. Depending on the file type, also display an emoji
 * @param {string} name : Attachment file name.
 * @param {number} size : Attached file size.
 * @param {datetime} created_at : Attachment file creation timestamp in UTC format, YYYY-MM-DDTHH:MM:SSZ.
 * @param {string} attachment_url : URL of the attachment.
 * @param {string} thumb_url : Thumbnail URL of the attachment.
 * @param {string} content_type : Information on the type of the attachment, for example - image/png, text, zip, and so on.
 */
function displayAttachmentsTable(name, size, created_at, attachment_url, thumb_url, content_type){
  
  const table = document.getElementById('attachmentsTable').insertRow(1);

  const c1 = table.insertCell(0);

  var setType = "";

  if(content_type=="image/apng" || content_type=="image/avif" || content_type=="image/gif" || content_type=="image/jpeg" || content_type=="image/png" || content_type=="image/svg" || content_type=="image/webp" || content_type=="image/bmp" || content_type=="image/x-icon" || content_type=="image/tiff") {
    setType = "🌆";
  } else if(content_type=="application/octet-stream") {
    setType = "📦";
  } else {
    setType = "🤷";
  }

  c1.innerHTML = setType + '<a class="attachment-filename" target="blank" href="'+attachment_url+'" data-toggle="tooltip" data-placement="top" title="Click to download">' + name + '</a><br /><br /><strong>File Size: </strong>' + size + '<br /><a href="' + thumb_url + '" target="_blank">View Thumbnail</a>';
}


/**
 * Function to display bookmarked tickets. Used after adding tickets, removing tickets and also onAppActivate
 */
function displayBookmarkedTickets(){
  client.data.get("domainName").then(
    function (freshdeskDomain) {
    
        getLoggedInUser().then(
            function (loggedInUser) {
                let data = {
                    'agentId': loggedInUser.id
                };

                client.request.invoke('displayBookmarkedTickets', data)
                    .then(
                        function (response) {

                            const bookmarksTable = document.getElementById('bookmarksTable');

                            if (response.response.savedTickets == null || response.response.savedTickets.length === 0) {
                                bookmarksTable.style.display = "none";
                                document.getElementById('existingBookmark').style.display = "none";
                                return;
                            }

                            bookmarksTable.style.display = "table";

                            const rowCount = bookmarksTable.rows.length;
                            for (let x = rowCount - 1; x > 0; x--) {
                                bookmarksTable.deleteRow(x);
                            }

                            response.response.savedTickets.forEach(ticket => {
                                insertRow(freshdeskDomain.domainName, ticket.ticketId, ticket.ticketSubject, ticket.personalNote, ticket.savedAt);
                                getCurrentTicket().then(function(currentTicket) {
                                  if(currentTicket.id == ticket.ticketId) {
                                    document.getElementById('bookmarksForm').style.display = "none";
                                    document.getElementById('existingBookmark').style.display = "block";
                                  } else {
                                    document.getElementById('bookmarksForm').style.display = "block";
                                    document.getElementById('existingBookmark').style.display = "none";
                                  }
                                })
                            });
                        },
                        function (error) {
                            document.innerHTML = "Unable to get agent tickets";
                            console.log("Something went wrong." + JSON.stringify(error))
                        }
                    )
            });
    },
    function (error) {
        console.error('Unable to get freshworks domain' + JSON.stringify(error));
        document.innerHTML = "Unable to show the tickets";
    });
}

/**
 * Function to display bookmarked tickets in a table in the sidebar.
 * @param {string} freshdeskDomainName 
 * @param {integer} ticketId 
 * @param {string} ticketSubject
 * @param {string} personalNote
 * @param {timestamp} savedAt 
 */
function insertRow(freshdeskDomainName, ticketId, ticketSubject, personalNote, savedAt) {
  const table = document.getElementById('bookmarksTable').insertRow(1);

  const c1 = table.insertCell(0);
  const c2 = table.insertCell(1);
  const c3 = table.insertCell(2);
  const c4 = table.insertCell(3);
  const c5 = table.insertCell(4);

  c1.innerHTML = '<a target="blank" href="https://' + freshdeskDomainName + '/a/tickets/'
      + ticketId + '" data-toggle="tooltip" data-placement="top" title="View Ticket" >' + ticketId + '</a>';
  c2.innerHTML = ticketSubject;
  c3.innerHTML = personalNote;
  c4.innerHTML = savedAt;
  c5.innerHTML = '<input id="' + ticketId + '" type="image" src="styles/images/delete.svg" style="height:20px; width:20px" onClick="removeTicket(this);" data-toggle="tooltip" data-placement="top" title="Delete bookmark" />';
}

/**
 * Function to store the ticket details in Data Store
 */
function bookmarkTicket() {
  getLoggedInUser().then(function (loggedInUser) {
      getCurrentTicket().then(function (ticket) {
          let data = {
              'agentId': loggedInUser.id,
              'ticketId': ticket.id,
              'ticketSubject': ticket.subject,
              'personalNote': document.getElementById("personalNote").value,
              'savedAt': new Date().getTime()
          };

          client.request.invoke("bookmarkTicket", data).then(
              function (data) {
                  
                  console.log("Bookmarked ticket: " + JSON.stringify(data))

                  const button = document.getElementById("saveBookmark");
                  button.disabled = true;
                  button.innerHTML = "Saved ✌";

                  client.interface.trigger("showNotify", {
                    type: "success", title: "Success",
                    message: "Your bookmark has been saved ✌"
                  }).then(function(data) {
                    console.log("Notified succes " + JSON.stringify(data))
                  }).catch(function(error) {
                    console.log("Something went wrong." + JSON.stringify(error))
                  });

                  displayBookmarkedTickets();
              },
              function (err) {
                  console.error('Error while saving ticket');
                  console.error(err);
          });
      })
  });
}

/**
 * Function to remove a ticket from the Data Store using the ticket id.
 * @param {int} ticket 
 */
function removeTicket(ticket) {
  getLoggedInUser().then(function (loggedInUser) {
      let data = {
          'agentId': loggedInUser.id,
          'ticketId': parseInt(ticket.id)
      }
      //console.info('Removing the agent ticket with data ' + JSON.stringify(data));
      client.request.invoke("removeAgentsTicket", data).then(
          function (data) {
              
              console.log("Removed ticket: " + JSON.stringify(data))
              client.interface.trigger("showNotify", {
                type: "danger", title: "Deleted",
                message: "Your bookmark has been removed"
              }).then(function(data) {
                console.log("Done: " + JSON.stringify(data))

              }).catch(function(error) {
                console.log("Something went wrong." + JSON.stringify(error))
              });

              displayBookmarkedTickets();

              getCurrentTicket().then(function(currentTicket) {
                if(currentTicket.id == ticket.id) {
                  //Alter the save button to re-enable the form after deleting the current ticket's bookmark
                  const button = document.getElementById("saveBookmark");
                  button.disabled = false;
                  button.innerHTML = "Save";
                  document.getElementById('bookmarksForm').style.display = "block";
                  document.getElementById('existingBookmark').style.display = "none";
                } else {

                }
              })
              
          },
          function (err) {
              console.error('Error while saving ticket');
              console.error(err.message);
          });
  });
}

/**
 * Error handler for the bookmarks functionality
 * @param {JSON object} err 
 */
 function handleErr(err) {
  console.error(`Unable to show agent's saved tickets`, err);
}

/**
 * Generic function to re-use and get current logged in user information using client.data.get("loggedInUser") API
 * @returns JSON Object - Current logged in user information
 */
function getLoggedInUser() {
  return client.data.get("loggedInUser").then(
      function (response) {
          return response.loggedInUser;
      },
      function (error) {
          console.error('Error while getting logged in user' + JSON.stringify(error));
      }
  );
}

/**
 * Get current open ticket information using client.data.get("ticket") API
 * @returns current ticket information
 */
function getCurrentTicket() {
  return client.data.get("ticket").then(
      function (data) {
          return data.ticket;
      },
      function (error) {
          // failure operation
          console.error('Error while fetching ticket details ' + JSON.stringify(error));
      }
  );
}

/**
 * Send string to Sentiment Analysis API and get sentiment data to show to the agent
 * @param {string} ticketText 
 */
function getSentiment(ticketText){

  return client.request.post("https://sentim-api.herokuapp.com/api/v1/", {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "text": ticketText.replace(/(<([^>]+)>)/gi, "")
    })
   }).then(function(data){
     if(data.status == 200) {
       return data.response;
     }
   }, function(error){
     console.log("sentiment API failed with error: " + JSON.stringify(error.response))
   });

}

/**
 * Function to store current open ticket into recently viewed list in Data Store.
 * Where: This is called from onAppActive()
 */
function recentlyViewed(){

  getCurrentTicket().then(function (ticket) {

    //save ticket id into the Data Store with a key.
    client.db.update( "recently-viewed", "append", { tickets: [ticket.id] }).then (
      function(data) {
        
        console.log("Updated recently-viewed " + JSON.stringify(data))
      },
      function(error) {
        console.log(error)
    });

    //get data from recently-viewed key from Data Store to check all recently viewed tickets
    client.data.get("domainName").then(
      function (freshdeskDomain) {
        client.db.get("recently-viewed").then (
          function(data) {
            var totalSizeOfTickets = 0;
            //get unique values of ticket ids
            list = data.tickets.filter(function (x, i, a) { 
              return a.indexOf(x) === i; 
            });

            client.iparams.get("viewHistorySize").then(function (iparam) {
              totalSizeOfTickets = iparam.viewHistorySize;

              //if tickets are more than the number set by the user, get the latest number of tickets as per the user's setting
              if(list.length > totalSizeOfTickets) {
                list = list.slice(totalSizeOfTickets);
              } else {
                //list = list.reverse()
              }
              
            });
            //parse through the recently viewed tickets and display in table
            list.forEach(y => {

              const recentlyViewedTable = document.getElementById('recentlyViewed').insertRow(1);
              const c1 = recentlyViewedTable.insertCell(0);
              c1.innerHTML = '<a target="blank" href="https://' + freshdeskDomain.domainName + '/a/tickets/'
                  + y + '">' + y + '</a>';

            });

          },
          function(error) {
            console.log(error)
            // failure operation
        });
      })
  })
}

/**
 * Function to get the list of conversations of the current open ticket
 * @param {int} ticketID 
 * @returns 
 */
async function getConversationsOfTicket(ticketID) {
    var headers = {
      "Authorization": "Basic <%= encode(iparam.APIKey + ':x') %>",
      "Content-Type": "application/json"
    };
    var options = { headers: headers };

    return client.data.get("domainName").then(
    function (freshdeskDomain) {
      return client.request.get("https://" + freshdeskDomain.domainName + "/api/v2/tickets/"+ticketID+"/conversations", options)
      .then(function(data){
        return data.response;
      }, function(error){
        console.log("Fetching Conversations API didn't work: " + JSON.stringify(error.response))
      });
    })

}