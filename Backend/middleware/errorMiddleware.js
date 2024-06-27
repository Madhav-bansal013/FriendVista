const errorMiddleware = (err, req, res, next) => {
    const defaultError = {
      statusCode: 404,
      success: "failed",
      message: err,
    };
  
    if (err?.name === "ValidationError") { //check if mongoose error
      defaultError.statusCode = 404;
  
      defaultError.message = Object.values(err, errors)
        .map((el) => el.message)
        .join(",");
        //Combines all error messages from the errors object of the err into a single string, separated by commas.
    }
  
    //duplicate error
    //error code  11000, indicates a duplicate key error.
  
    if (err.code && err.code === 11000) {
      defaultError.statusCode = 404;
      defaultError.message = `${Object.values(
        err.keyValue
      )} field has to be unique!`;
    }
  
    //sending error response
    res.status(defaultError.statusCode).json({
      success: defaultError.success,
      message: defaultError.message,
    });
  };
  
  export default errorMiddleware;