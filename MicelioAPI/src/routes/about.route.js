
const express = require('express');
const path = require("path");
const Router = express.Router();

Router.get('/', async (request, response) => {
  const baseDir = path.join(__dirname, '..', '..')
  return response.status(200).sendFile('README.md', {root: baseDir});
});

module.exports = Router; 


/*
 summary for overleaf documentation:

---

### 🛠️ **Issue: `/about` content not displaying on the frontend**

* **Cause:**
  The backend route in `about.route.js` was defined as `GET /about`, and it was mounted in `routes.js` under `/about`. This resulted in the full path becoming `/api/about/about`, which caused a 404 error when the frontend called `/api/about`.

* **Solution:**
  Changed the route definition in `about.route.js` from `Router.get('/about'...)` to `Router.get('/'...)` so that the final path correctly resolves to `/api/about`.

* **Result:**
  The frontend successfully fetched and rendered the README content using `ReactMarkdown`.

-----------

Latex

\section{Issue: About Page Not Displaying}

\begin{description}
  \item[Problem:] The frontend requested the \verb|/api/about| endpoint, but the backend returned a 404 Not Found.
  
  \item[Cause:] The route in \verb|about.route.js| was defined as \verb|get('/about')|, and it was mounted at \verb|/about| in \verb|routes.js|. This caused the endpoint to resolve as \verb|/api/about/about|.
  
  \item[Solution:] Changed the route definition in \verb|about.route.js| from:
  
  \begin{verbatim}
  Router.get('/about', ...)
  \end{verbatim}
  
  to:
  
  \begin{verbatim}
  Router.get('/', ...)
  \end{verbatim}

  \item[Result:] The backend now correctly responds to \verb|/api/about|, and the frontend displays the README content using \verb|ReactMarkdown|.
\end{description}





*/
