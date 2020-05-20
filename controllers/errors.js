exports.get404Page = (req, res) => {
  res
    .status(404)
    .render("404", {
      pageTitle: "Page Not Found",
      path: req.baseUrl,
      isAuthenticated: req.session.isLoggedIn,
    });
};


exports.get500Page = (req,res) => {
  res.status(500).render("500" , { 
    pageTitle : "Error!",
    path : "/500",
    isAuthenticated : req.session.isLoggedIn,
  })
}