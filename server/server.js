exports = {
    bookmarkTicket: async function (request) {
        saveTicketForAgent(request).then(
            function(data) {
                renderData(null, data); 
            }, 
            function(error) {
                renderData(error, null); 
            }
        )
    },
    displayBookmarkedTickets: async function (request) {
        getAgentTicketsFromDb(request.agentId).then(
            function(data) {
                
                renderData(null, data); 
            }, 
            function(errorMessage) {
                console.error('Error occurred while fetching tickets from DB ' + errorMessage)
                renderData(null, []);
            }
        )
    },
    removeAgentsTicket: async function (request) {
        //console.info('Remove request received ' + JSON.stringify(request));
        if (request == null || request.agentId == null) {
            renderData(null,  {'message': 'Agent ID cannot be empty'}); 
            return; 
        }

        if (request.ticketId == null) {
            renderData(null, {'message': 'Ticket ID cannot be empty'}); 
            return; 
        }

        removeAgentTicket(request.agentId, request.ticketId)
        .then(
            function(data) {
                renderData(null, data); 
            }, 
            function(error) {
                renderData(error, null); 
            }
        );
    }
};

async function saveTicketForAgent(request) {
    try {
        let existingTickets = null; 
        try {
            existingTickets = await getAgentTicketsFromDb(request.agentId)
        } catch(err) {
            // Do nothing 
        }
        if (existingTickets === null || existingTickets.savedTickets === null) {
            let saveTicketResponse = await saveTicketInDb(request.agentId, request.ticketId, request.personalNote);
            return saveTicketResponse; 
        }

        let filteredTicketByRequestedId = existingTickets.savedTickets.filter((ticket) => ticket.ticketId === request.ticketId);

        if (filteredTicketByRequestedId.length > 0) {
            await removeAgentTicket(request.agentId, request.ticketId);
        }


        let saveTicketResponse = await saveTicketInDb(request.agentId, request.ticketId, request.ticketSubject, request.personalNote, request.savedAt);       
        return saveTicketResponse; 

    } catch(err) {
        console.error(err); 
        throw err; 
    }
}

async function removeAgentTicket(agentId, ticketId) {
    try {
        let existingTickets = null; 

        try {
            existingTickets = await getAgentTicketsFromDb(agentId);
        } catch(err) {
            throw "Ticket is not saved for the agent";
        }

        if (existingTickets === null || existingTickets.savedTickets === null) {
            console.error('No saved ticket. Returning error');
            throw "Ticket is not saved for the agent"; 
        }

        let filteredTicketByRequestedId = existingTickets.savedTickets.filter((ticket) => ticket.ticketId === ticketId);

        if (filteredTicketByRequestedId.length == 0) {
            throw "Ticket is not saved for the agent"; 
        }

        let remainingTickets = existingTickets.savedTickets.filter((ticket) => ticket.ticketId !== ticketId);

        return $db.update("agentId: " + agentId, "set", { savedTickets: remainingTickets})
        .then(
            function (response) {
                return response;
            },
            function (error) {
                console.error('Failed to remove the ticket' + JSON.stringify(error));
                throw 'Failed to remove ticket';
            }
        );

    } catch(err) {
        console.error(err); 
        throw err; 
    }
}

function getAgentTicketsFromDb(agentId) {
    try {
        return $db.get("agentId: " + agentId)
    } catch(err) {
        console.error('Error while fetching saved ticket ' + JSON.stringify(err));
        return null; 
    }
}

function saveTicketInDb(agentId, ticketId, ticketSubject, personalNote, savedAt) {
    if (agentId === null || agentId === undefined || ticketId === null || ticketId === undefined) {
        throw 'Agent ID and ticket ID cannot be null'; 
    }
    return $db.update("agentId: " + agentId, "append", { savedTickets: [{'ticketId': ticketId, 'ticketSubject': ticketSubject, 'personalNote': personalNote, 'savedAt': savedAt}]})
        .then(
            function (response) {
                return response;
            },
            function (error) {
                console.error('Failed to update ticket: ' + JSON.stringify(error));
            }
        );
}

