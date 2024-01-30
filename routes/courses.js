// courses router file
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const contentful = require("contentful");
const contentfulManagement = require("contentful-management");
const User = require("../schemas/user");
const course = require("../schemas/course");
const achievments = require("../schemas/achievment");

//contentful connect
const contentClient = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// Create a Contentful Management client
const contentfulManagementClient = contentfulManagement.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

// courses from contentful
router.get("/", async (req, res) => {
  try {
    const entries = await contentClient.getEntries({
      content_type: "course",
    });

    // Transform Contentful data as needed
    const coursesFromContentful = entries.items.map((item) => ({
      id: item.sys.id,
      courseName: item.fields.courseName,
      description: item.fields.courseDescription,
      courseImage: item.fields.courseImage,
      courseContent: item.fields.courseContent,
      courseDepartment: item.fields.courseDepartment,
    }));
    res.json(coursesFromContentful);
  } catch (error) {
    console.error("Error fetching data from Contentful:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//course enroll
router.post("/enroll", async (req, res) => {
  console.log("user: " + req.user);
  const userId = req.user._id;
  let courseId = req.body.courseId;
  const courseName = req.body.courseName;
  console.log("course name: " + courseName);

  const entries = await contentClient.getEntry(courseId);

  if (!userId) {
    return res.status(400).send("Missing User or Course ID");
  }

  const existingCourse = entries; // Access the first entry

  try {
    let Coursesdb = await course.findOne({ name: courseName });

    if (!Coursesdb) {
      const newCourse = new course({
        name: courseName,
        department: existingCourse.fields.courseDepartment,
      });
      await newCourse.save();
      console.log("New course created");
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          enrolledCourses: {
            courseName: courseName, // Store only course reference
          },
        },
      },
      { new: true }
    );

    console.log("User enrolled in the course", updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    // Handle specific errors and send appropriate responses to the client
  }
});

//get courses from contentful with filter of user courses passed in the req.params
router.get("/profileCourses", async (req, res) => {
  const userCoursesArray = req.query.userCourses;

  try {
    // Use the $in operator to filter courses based on the names in userCoursesArray
    const entries = await contentClient.getEntries({
      content_type: "course",
      "fields.courseName[in]": userCoursesArray,
    });

    // Transform Contentful data as needed
    const coursesFromContentful = entries.items.map((item) => ({
      id: item.sys.id,
      courseName: item.fields.courseName,
      description: item.fields.courseDescription,
      courseImage: item.fields.courseImage,
      courseDepartment: item.fields.courseDepartment,
    }));

    res.json(coursesFromContentful);
  } catch (error) {
    console.error("Error getting user courses from Contentful:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get a single course all content
router.get("/content", async (req, res) => {
  let courseId = req.query.id;
  try {
    const entry = await contentClient.getEntry(courseId);
    if (!entry) {
      return res.status(404).send(`No course found for ID ${courseId}`);
    }
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("apikey:" + apiKey);
    res.json({ ...entry.fields, API_KEY: apiKey });
    console.log({ ...entry.fields, API_KEY: apiKey });
  } catch (err) {
    console.log("ERROR GETTING SINGLE COURSE", err);
    res.status(500).send("Server error");
  }
});

// recommended courses
router.get("/recommended", async (req, res) => {
  try {
    const userCoursesArray = req.user.enrolledCourses ?? [];
    const flatteneduserCoursesArray = userCoursesArray.map(
      (obj) => obj.courseName
    );
    const entries = await contentClient.getEntries({
      content_type: "course",
      "fields.courseDepartment": req.user.Field,
    });

    // Filter out courses that the user is already enrolled in
    const filteredEntries = entries.items.filter(
      (entry) => !flatteneduserCoursesArray.includes(entry.fields.courseName)
    );

    const recommendedCourses = filteredEntries.map((item) => ({
      id: item.sys.id,
      courseName: item.fields.courseName,
      description: item.fields.courseDescription,
      courseImage: item.fields.courseImage,
      courseContent: item.fields.courseContent,
      courseDepartment: item.fields.courseDepartment,
    }));
    console.log(recommendedCourses);
    res.json(recommendedCourses);
  } catch (error) {
    console.error("Error fetching data from Contentful:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get badges from contentful 
router.get("/badges", async (req, res) => {
  try {

    // Fetch user data based on the provided user ID (assuming you have a User model)
    const user = req.user

    // Check if the user was found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

     // Get badge names from the user data
     const badgeNames = user.badges;

    // Check if any badge names were found
    if (!badgeNames || badgeNames.length === 0) {
      return res.status(404).json({ error: "User has no badges" });
    }
    console.log(badgeNames)

    const entries = await contentClient.getEntries({
      content_type: "achievementBadge",
      "fields.name[in]": badgeNames, // Use the 'in' operator to match any name in the array
    });

    // Check if any entries were found
    if (!entries.items || entries.items.length === 0) {
      return res.status(404).json({ error: "Badges not found" });
    }

    const badges = entries.items.map((item) => ({
      id: item.sys.id,
      name: item.fields.name,
      description: item.fields.description,
      image: item.fields.image,
      points: item.fields.points,
      category: item.fields.category,
    }));

    res.json(badges);
    console.log("badges: ", badges);
    console.log("entries: ", entries);
  } catch (error) {
    console.error("Error fetching data from Contentful:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to get all badges from Contentful
router.get("/allBadges", async (req, res) => {
  try {
    // Fetch all entries of type "badge" from Contentful
    const entries = await contentClient.getEntries({
      content_type: "achievementBadge",
    });

    // Check if any entries were found
    if (!entries.items || entries.items.length === 0) {
      return res.status(404).json({ error: "No badges found" });
    }

    // Transform Contentful data as needed
    const badges = entries.items.map((item) => ({
      id: item.sys.id,
      name: item.fields.name,
      description: item.fields.description,
      image: item.fields.image,
      points: item.fields.points,
      category: item.fields.status,
    }));

    // Send the badges in the response
    res.json(badges);
  } catch (error) {
    console.error("Error fetching badges from Contentful:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to get all content types from Contentful
router.get("/contentTypes", async (req, res) => {
  try {
    // Fetch all content types from Contentful Management API
    const space = await contentfulManagementClient.getSpace(
      process.env.CONTENTFUL_SPACE_ID
    ).then((space) => space.getEnvironment('master'))
    .then((environment) => environment.getContentTypes())
    .then((response) => console.log(response.items))
    .catch(console.error)

  } catch (error) {
    console.error("Error fetching content types from Contentful:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/addBadge", async (req, res) => {
  try {
    const { badgeName } = req.body;
    const userId = req.user._id;

    // Check if userId and badgeName are provided
    if (!userId || !badgeName) {
      return res.status(400).json({ error: "userId and badgeName are required" });
    }

    // Find the user by userId
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize the badges array if it doesn't exist
    if (!user.badges) {
      user.badges = [];
    }

    // Check if the badge already exists in the user's badges array
    if (user.badges.includes(badgeName)) {
      return res.status(400).json({ error: "Badge already added to the user" });
    }

    // Add the badge to the user's badges array
    user.badges.push(badgeName);
    await user.save();

    res.json({ message: "Badge added successfully", user: user });
  } catch (error) {
    console.error("Error adding badge to user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/todoToggled", async (req, res) => {
  try {
    const { todoId } = req.body;
    const userId = req.user._id;
    // Find the user by userId
    const user = await User.findById(userId);
    
    // Check if user is defined
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has array todosDone and if not push an empty array called todosDone
    if (!user.todosDone) {
      user.todosDone = [];
    }

    // Check if the todo is already in the array
    if (user.todosDone.includes(todoId)) {
      // Remove the todoId from the todosDone array
      user.todosDone = user.todosDone.filter(id => id !== todoId);
      // Decrement user score by one
      user.totalScore -= 1;
      await user.save();
      // Return todo is undone
      res.status(200).json({ todoDone: false, todosDone: user.todosDone });
    } else {
      // Add the todoId to the todoDone array
      user.todosDone.push(todoId);
      // Increment user score by one
      user.totalScore += 1;
      await user.save();
      // Return todo is done
      res.status(200).json({ todoDone: true, todosDone: user.todosDone });
    }
  } catch (error) {
    console.error("Error toggling todo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
