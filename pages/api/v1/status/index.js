function status(request, response) {
  response.status(200).json({
    msg: "Ihaaaaa!",
  });
}

export default status;
