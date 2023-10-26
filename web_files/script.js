var file_element = document.querySelector('input[type=file]')

function handle_browse_click(){
    file_element.click()
}

function toggle_view(view){
    let preview_box = document.querySelector('#preview_box')
    let upload_box = document.querySelector('#upload_box')

    if(view=='preview'){
        preview_box.style.display = 'flex'
        preview_box.style.flexDirection = 'column'
        upload_box.style.display = 'none'
    }
    else{
        // preview_box.style.display = 'none'
        // upload_box.style.display = 'flex'
        // upload_box.style.flexDirection = 'column'
        window.location.replace('/')
    }
}

file_element.addEventListener('change', ()=>{
    // Show image preview
    let fileReader = new FileReader();
    fileReader.readAsDataURL(file_element.files[0]);
    fileReader.addEventListener("load", function () {
      document.querySelector('#preview_image').src = this.result
      toggle_view('preview')
    });    
})


// Firebase

const firebaseConfig = {
    apiKey: "AIzaSyDtdZ_zgPYSFC90dLpi5blzHqUEa2QN4d8",
    authDomain: "plant-doc-8fbd5.firebaseapp.com",
    databaseURL: "https://plant-doc-8fbd5-default-rtdb.firebaseio.com",
    projectId: "plant-doc-8fbd5",
    storageBucket: "plant-doc-8fbd5.appspot.com",
    messagingSenderId: "626911451884",
    appId: "1:626911451884:web:8b131b636fad09108aa3c9",
    measurementId: "G-05RC7BMTKK"
  };


  firebase.initializeApp(firebaseConfig);

  function uploadImage() {

    // Change text of the button

    let btn = document.querySelector('#upload_image_btn')
    btn.innerText = 'Uploading'
    btn.disabled = "true"

    // Upload image to firebase
    const ref = firebase.storage().ref();
    const file = file_element.files[0];
    const name = +new Date() + "-" + file.name;
    const metadata = {
       contentType: file.type
    };
    const task = ref.child(name).put(file, metadata);task
    .then(snapshot => snapshot.ref.getDownloadURL())
    .then(url => {
    console.log(url);

    // Set text of button

    document.querySelector('#upload_image_btn').innerText = 'Scanning leaf'
    
    // Post image to server after getting url
    post_image(url)

 })
 .catch(console.error);
 }

function post_image(url){
  
  let host = 'http://localhost:5000/predict'
  fetch(host, {
    method: 'POST',
    body: new FormData(document.querySelector('form'))
  }).then(res=>{

   
      let res_data =  res.json()
      res_data.then(data=>{
        console.log(data);
        // Redirect to report.html after getting result
        data['original_image'] = url
        window.localStorage.setItem('data', JSON.stringify(data))
        let query = new URLSearchParams(data).toString();
        window.location.replace('/report.html')
      })
      .catch(e=>{
        window.location.replace('/invalid.html')
      })
  

    })

 }