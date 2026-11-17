/*
function buildCard(id, title, imageURL){
    return `
    <div class="card bg-base-100 w-96 shadow-sm">
        <figure>
            <img src="${imageURL}" alt="${title}" />
        </figure>
        <div class="card-body">
            <h2 class="card-title">${title}</h2>
        </div>
    </div>
    `;
}


function buildAPICards() {
    fetch("https://jsonplaceholder.typicode.com/photos")
    .then((response) => response.json())
    .then((images) => {
    for (let i = 0; i < 20; i++) {
        let id = images[i].id;
        let title = images[i].title;
        let imageUrl = images[i].thumbnailUrl;
        let cardHtml = buildCard(id, title, imageUrl);
        dynamicContent.innerHTML += cardHtml;
    }
    })
    .catch((error) => {
        console.log("Something went wrong");
    });
}



let dynamicContent = document.querySelector('#dynamic-content');
buildAPICards();
*/