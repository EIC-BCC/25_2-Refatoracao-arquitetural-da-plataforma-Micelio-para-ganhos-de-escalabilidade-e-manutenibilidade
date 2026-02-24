function LogMiddleware(request, response, next) {

    const marker = ' :: ';
    const data = request.method + marker +  request.originalUrl ;   //i removed this part that was joined marker +  request.headers.token
    
    console.log(data);

    console.log('Request Headers:', request.headers);
    console.log('Request Body:', request.body);

    next();

}


module.exports = LogMiddleware;