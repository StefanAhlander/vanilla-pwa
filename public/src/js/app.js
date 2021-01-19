let deferedPrompt;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/serviceworker.js')
    .then(function () {
      console.log('ServiceWorker registered.');
    })
    .catch((err) => console.error(err));
}

window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  deferedPrompt = event;
  return false;
});

fetch('https://httpbin.org/post', {
  method: 'POST',
  mode: 'cors',
  body: 'boom! I hit you!',
})
  .then((response) => {
    console.log(response);
    return response.json();
  })
  .then((data) => console.log(data.data))
  .catch((err) => console.error(err));
