const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = "dbanda99";
const REPO_NAME = "open-up-data";
const FILE_PATH = "members.json";

// Toggle between login and register forms
document.addEventListener("DOMContentLoaded", function () {
    showLogin(); // Show login form by default
});

function showLogin() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-tab").classList.add("active");
    document.getElementById("register-tab").classList.remove("active");
}

function showRegister() {
    document.getElementById("register-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-tab").classList.add("active");
    document.getElementById("login-tab").classList.remove("active");
}

// Helper function to fetch members.json content from GitHub
async function fetchMembers() {
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch members.json");
        }

        const data = await response.json();
        const content = atob(data.content); // Decode base64 content
        return JSON.parse(content); // Parse JSON
    } catch (error) {
        console.error("Error fetching members:", error);
        alert("Error fetching members data. Please try again later.");
        return [];
    }
}

// Helper function to update members.json on GitHub
async function updateMembers(newMembers) {
    try {
        const getResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`
            }
        });
        
        if (!getResponse.ok) {
            throw new Error("Failed to retrieve SHA for members.json");
        }

        const getData = await getResponse.json();
        const sha = getData.sha;

        // Encode updated content in Base64
        const updatedContent = btoa(JSON.stringify(newMembers, null, 2));

        // Update the file with the new data
        const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Update members.json",
                content: updatedContent,
                sha: sha
            })
        });

        if (!updateResponse.ok) {
            throw new Error("Failed to update members.json");
        }

        alert("Account Successfully created!");
    } catch (error) {
        console.error("Error updating members:", error);
        alert("Error updating members data. Please try again later.");
    }
}

// Register a new user
async function registerUser(email, password) {
    const members = await fetchMembers();
    const userExists = members.some(member => member.email === email);

    if (userExists) {
        alert("User already exists! Please log in instead.");
        return;
    }

    members.push({
        email: email,
        password: password, // Ideally, you'd hash the password before storing
        "profile-picture": "" // Optional: add a default profile picture URL if desired
    });

    await updateMembers(members);
}

// Login a user
async function loginUser(email, password) {
    const members = await fetchMembers();
    const user = members.find(member => member.email === email && member.password === password);

    if (user) {
        alert("Login successful!");
    } else {
        alert("Incorrect Email or Password. Please try again!");
    }
}

// Event listeners for login and register
document.getElementById("login-button").addEventListener("click", function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    loginUser(email, password);
});

document.getElementById("register-button").addEventListener("click", function (e) {
    e.preventDefault();
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    registerUser(email, password);
});
