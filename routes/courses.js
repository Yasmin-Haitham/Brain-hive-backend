// courses router file
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const contentful = require("contentful");
const user = require("../schemas/user");
const course = require("../schemas/course");

//contentful connect
const contentClient = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
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
    const updatedUser = await user.findOneAndUpdate(
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
router.get('/profileCourses', async (req, res) => {
  const userCoursesArray = req.query.userCourses;
  console.log(userCoursesArray)

  try {
    // Use the $in operator to filter courses based on the names in userCoursesArray
    const entries = await contentClient.getEntries({
      content_type: 'course',
      'fields.courseName[in]': userCoursesArray,
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
    console.error('Error getting user courses from Contentful:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
