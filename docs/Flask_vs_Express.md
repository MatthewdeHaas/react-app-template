# HTMX + Flask Vs. React + Express


HTMX + Flask and React + Express are two different approaches in developing a full stack web app (excluding the need for a database). They differ in various aspects, but I intend here to highlight, at a high level, their respective flow of information from the front end to the back end. I intend on highlighting this contrast so that one can understand their respective advantages and bridge the gap between their differences so one can leverage their knowledge of one in learning the other.

## HTMX + Flask
### Overview
HTMX is a front end JavaScript framework that allows one to send HTTP requests, as well as swap partial DOM content, directly from any HTML element. This means one can make requests to the server, as well as read/write to/from the database, without using Fetch or related APIs. Flask is a web framework for Python, meaning it is a library that allows one to handle HTTP requests issued by a client.

### Flow of Information
The following outlines how a request is sent from a client (browser), received, handled, and sent back with this stack:
- Client visits an endpoint. This can be triggered in a variety of ways with HTMX. Mainly this is visiting a page or clicking a button.
- HTTP request is sent over the internet to the endpoint
- There is a Python function written to handle the HTTP request sent to this particular endpoint. Here the database can be read/written from/to, HTTP response headers can be set, and a response can be returned
- **Flask serves HTML** back to the client
- Assuming the response was well received, HTMX decides what to do with the HTML response. It can do partial swaps via AJAX, render entire pages, nothing at all, etc.


## React + Express
React is a front end JavaScript framework that makes creating modern web apps easier. A popular way to send HTTP request with React is with the builtin promised-based JavaScript Fetch API. node.js is a JavaScript runtime environment, meaning it allows JavaScript to run outside of the client's browser and thus JavaScript can be used to handle HTTP requests just like how our Flask app does. express.js is a JavaScript back end framework that makes handling HTTP requests with Node easier, thus it I will refer to Express as responsible for the back end code, even though Node is what powers a web app with a JavaScript back end.

### Flow of Information
The following outlines how a request is sent from a client (browser), received, handled, and sent back with this stack:
- Client issues an HTTP request, either clicking a button or visiting an endpoint. This would be setup in a .jsx (or .tsx for TypeScript) file, which is a special file that allows one to write HTML directly in a JavaScript file.
- The endpoint is handled in a JavaScript file. Note that since Node is a runtime environment, in order for this code to be written, there must be an additional port listening for HTTP requests separate for the one used for the React (typically 3000 for React app and 5000 for the Express server)
 - **Express servers JSON**
 - React receives the JSON response and decides on the how to render HTML based on the response


## Main Differences

|  | HTMX + Flask | React + Express |
| ---- | ------------ | --------------- |
| Request Protocol  | Send HTTP request via hx-get, hx-post, etc. directly from an HTML file | Send HTTP request via the Fetch API in a React component in a .jsx file (js + HTML hybrid file)
| Response Type |  Servers HTML | Serves JSON |
| Client Handling the Server Response | HTMX tells the browser where and how to swap the HTML it receives | React builds and renders React components (basically HTML) based on the JSON response it receives



