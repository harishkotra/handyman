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
  
  document.addEventListener('DOMContentLoaded', function () {

    app.initialized().then(function (_client) {
      window._client = _client;    
        //fetch bookmarked tickets
        displayBookmarkedTickets();
    });
  });
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
                                  hide(q('#bookmarksTable'));
                                  hide(q('#existingBookmark'));
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
                                      hide(q('#bookmarksForm'));
                                      show(q('#existingBookmark'));
                                    } else {
                                      show(q('#bookmarksForm'));
                                      hide(q('#existingBookmark'));
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
  
    //const c1 = table.insertCell(0);
    const c1 = table.insertCell(0);
    const c2 = table.insertCell(1);
    const c3 = table.insertCell(2);
    const c4 = table.insertCell(3);
    
    //c1.innerHTML = '<a target="blank" href="https://' + freshdeskDomainName + '/a/tickets/' + ticketId + '" data-toggle="tooltip" data-placement="top" title="View Ticket" >' + ticketId + '</a>';
    c1.innerHTML = '<a target="blank" href="https://' + freshdeskDomainName + '/a/tickets/'
    + ticketId + '" data-toggle="tooltip" data-placement="top" title="View Ticket" >' + ticketSubject + '</a>';
    c2.innerHTML = personalNote;
    c3.innerHTML = new Date(savedAt);
    c4.innerHTML = '<input id="' + ticketId + '" type="image" src="../styles/images/delete.svg" style="height:20px; width:20px" onClick="removeTicket(this);" data-toggle="tooltip" data-placement="top" title="Delete bookmark" />';
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
  
                    // client.interface.trigger("showNotify", {
                    //   type: "success", title: "Success",
                    //   message: "Your bookmark has been saved ✌"
                    // }).then(function(data) {
                    //   console.log("Notified success " + JSON.stringify(data))
                    // }).catch(function(error) {
                    //   console.log("Something went wrong." + JSON.stringify(error))
                    // });
  
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
                
                //console.log("Removed ticket: " + JSON.stringify(data))
                // client.interface.trigger("showNotify", {
                //   type: "danger", title: "Deleted",
                //   message: "Your bookmark has been removed"
                // }).then(function(data) {
                //   //console.log("Done: " + JSON.stringify(data))
                // }).catch(function(error) {
                //   console.log("Something went wrong." + JSON.stringify(error))
                // });
  
                displayBookmarkedTickets();
  
                getCurrentTicket().then(function(currentTicket) {
                  if(currentTicket.id == ticket.id) {
                    //Alter the save button to re-enable the form after deleting the current ticket's bookmark
                    const button = document.getElementById("saveBookmark");
                    button.disabled = false;
                    button.innerHTML = "Save";
                    show(q('#bookmarksForm'));
                    hide(q('#existingBookmark'));
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
   * 
   * @param {DOM Element} selector 
   * @returns 
   */
  function q(selector) {
    return document.querySelector(selector);
  }
  /**
   * 
   * @param {#ID} element identifier
   */
  function hide(element) {
    element.style.display = 'none';
  }
  
  /**
   * 
   * @param {#ID} element identifier
   */
  function show(element) {
    element.style.display = '';
  }