const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://xndmxditrxwspvqrbbfl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZG14ZGl0cnh3c3B2cXJiYmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0Mzk1MTQsImV4cCI6MjAxNzAxNTUxNH0.WiRJfOr5mGG1TQLkmjVWBpPRxQZYLs6dfntaUIkEw1w"
);

const app = express();
const port = 3000;

const processGroupData = async () => {
  try {
    const { data: groups, error } = await supabase.from("groups").select("*");

    if (error) {
      throw error;
    }

    groups.forEach(async (group) => {
      const members = group.group_members;
      const allLiked = members
        .map((member) => member.liked)
        .reduce((a, b) => a.filter((c) => b.includes(c)));

      if (allLiked.length > 0) {
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

setInterval(processGroupData, 1000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
