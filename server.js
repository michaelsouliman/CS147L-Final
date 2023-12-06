// Require necessary packages
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

// Supabase setup
const supabase = createClient(
  "https://xndmxditrxwspvqrbbfl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZG14ZGl0cnh3c3B2cXJiYmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0Mzk1MTQsImV4cCI6MjAxNzAxNTUxNH0.WiRJfOr5mGG1TQLkmjVWBpPRxQZYLs6dfntaUIkEw1w"
);

// Express setup
const app = express();
const port = 3000;

// Function to process the group members data
const processGroupData = async () => {
  // Fetch the current group data
  try {
    const { data: groups, error } = await supabase.from("groups").select("*");

    if (error) {
      throw error;
    }

    // Process each group
    groups.forEach(async (group) => {
      const members = group.group_members;
      const allLiked = members
        .map((member) => member.liked)
        .reduce((a, b) => a.filter((c) => b.includes(c)));

      // Check if there is a common liked item
      if (allLiked.length > 0) {
        // Update the group with the common liked item
        const { error } = await supabase
          .from("groups")
          .update({ all_liked: allLiked[0], found_all_liked: true })
          .match({ group_code: group.group_code });

        if (error) {
          throw error;
        }
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// Set up a periodic task to process group data
setInterval(processGroupData, 10000);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
