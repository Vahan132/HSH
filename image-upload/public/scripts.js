// Handle image preview
const fileInput = document.getElementById('images');
const imagePreviewContainer = document.getElementById('image-preview');

let checkboxes = document.querySelectorAll('input[name="categories"]')

checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
        checkboxes.forEach((checkbox) => {
            if (checkbox !== e.currentTarget) {
                checkbox.checked = false;
            }
        });
    })
});

function loadImages() {
    // Fetch the uploaded images from the server
    fetch("https://hshfurnitures.com/get-images")
        .then((response) => response.json())
        .then((data) => {
            const imageListDiv = document.getElementById("imageList");
            imageListDiv.innerHTML = ""; // Clear existing images

            data.images.forEach((image) => {
                const imageDiv = document.createElement("div");
                imageDiv.className = "item-img";
                imageDiv.innerHTML = `
                    <img src="/uploads/${image.category}/${image.filename}" alt="${image.filename}" width="100">
                    <button onclick="deleteImage('${image.category}', '${image.filename}')">Delete</button>
                `;
                imageListDiv.appendChild(imageDiv);
            });
        });
}

function deleteImage(category, filename) {
    fetch(`https://hshfurnitures.com/delete/${category}/${filename}`, {
        method: "DELETE"
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
            loadImages(); // Reload images after deletion
        })
        .catch((error) => {
            console.error("Error deleting file:", error);
        });
}

// Load images when the page loads
window.onload = loadImages;

// Listen for file input changes
fileInput.addEventListener('change', (event) => {
    imagePreviewContainer.innerHTML = ''; // Clear existing preview
    const files = event.target.files;

    // Preview each image
    Array.from(files).forEach((file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            imagePreviewContainer.appendChild(img);
        };

        reader.readAsDataURL(file);
    });
});

// Handle form submission
const form = document.getElementById('upload-form');

form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get selected categories
    const categories = [];
    document.querySelectorAll('input[name="categories"]:checked').forEach((checkbox) => {
        categories.push(checkbox.value);
    });

    if (categories.length === 0) {
        alert('Please select at least one category!');
        return;
    }

    const formData = new FormData(form);
    formData.append('categories', JSON.stringify(categories)); // Append categories to form data

    // Make an AJAX request to submit the form data
    const responseMessage = document.getElementById('response-message');
    responseMessage.textContent = 'Uploading images...';

    fetch('https://hshfurnitures.com/upload', {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            responseMessage.textContent = 'Upload successful!';
        })
        .catch((error) => {
            responseMessage.textContent = 'Error: ' + error.message;
        });
});
