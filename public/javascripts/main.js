    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var snap = document.getElementById('snap');
    var socket = io();
    
    window.onload = function() {
      
      var context = canvas.getContext('2d');
      var context_snap = snap.getContext('2d');
      
      var tracker = new tracking.ObjectTracker('face');
      tracker.setInitialScale(4);
      tracker.setStepSize(2);
      tracker.setEdgesDensity(0.1);

      tracking.track('#video', tracker, { camera: true });

      tracker.on('track', function(event) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        event.data.forEach(function(rect) {           
          context.drawImage(video, 0, 0, video.width, video.height);
          
          snap.height = rect.height;
          snap.width = rect.width;	      
          context_snap.putImageData(context.getImageData(rect.x, rect.y, rect.width, rect.height), 0, 0);
          
          socket.emit('face_tracking', snap.toDataURL());
          
          context.beginPath();
	        context.arc(rect.x + rect.width/2, rect.y + rect.height/2, rect.width/2, 0, 2 * Math.PI, false);
	        context.lineWidth = 3;
	        context.strokeStyle = '#a64ceb';
	        context.stroke();
	        /*
	        socket.on('name', function(data){
	          console.log(data); 
	          
	        });
	        */
	      
        });
      });

      /*var gui = new dat.GUI();
      gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
      gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
      gui.add(tracker, 'stepSize', 1, 5).step(0.1);*/
      

      
            
    };
    
    function take_face(context){
        var dataURL = context.toDataURL();
        document.getElementById('face').src = dataURL;
        return dataURL;
    }
    
    function send_face(snap){
        socket.emit('face', snap);
    }
    
    socket.on('name', function(data){
      console.log(data); 
    });
    
