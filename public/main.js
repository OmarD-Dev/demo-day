const edit = document.getElementsByClassName("fa-pencil");
const trash = document.getElementsByClassName("fa-ban");

Array.from(edit).forEach(function(element) {
      element.addEventListener('click', function(){                               
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        const edit = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
        fetch('/editStudy/:currentStudy', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'name': name,
            'msg': msg,                                  
            'edit':edit
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});



Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        console.log('What is this? : ', this.parentNode.parentNode.childNodes[2])
        // const title = this.parentNode.parentNode.childNodes[3].innerText
        // const type = this.parentNode.parentNode.childNodes[4].innerText
        // const description = this.parentNode.parentNode.childNodes[5].innerText
        const title = this.parentNode.parentNode.querySelector('.card-title').innerText
        const type = this.parentNode.parentNode.querySelector('.card-subtitle').innerText
        const description = this.parentNode.parentNode.querySelector('.card-text').innerText
        
        fetch('createStudy', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'title': title,
            'type': type,
            'description': description
          })
        }).then(function (response) {
          window.location.reload(true)
        })
      });
});
