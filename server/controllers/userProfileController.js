// controllers/userProfileController.js
exports.getUserSettings = (req, res) => {
    // Return dummy settings (update this logic as needed)
    res.json({
      notifications: true,
      privacy: { shareEmail: false },
      theme: "light",
      language: "en",
    });
  };
  
  exports.updateUserSettings = (req, res) => {
    // For now, just echo back what was sent
    res.json({ message: "User settings updated", settings: req.body });
  };
  
  exports.getActivityHistory = (req, res) => {
    // Return dummy activity history
    res.json([
      { type: "search", query: "Kathmandu", date: new Date() },
      { type: "itinerary", query: "Cultural Tour", date: new Date() },
    ]);
  };
  
  exports.getRecommendations = (req, res) => {
    // Return dummy recommendations
    res.json([{ place: "Pashupatinath Temple" }, { place: "Boudhanath Stupa" }]);
  };
  
  exports.postFeedback = (req, res) => {
    // Dummy feedback submission
    res.json({ message: "Feedback submitted successfully" });
  };
  
  exports.deleteAccount = (req, res) => {
    // Dummy delete account response
    res.json({ message: "User account deleted" });
  };
  