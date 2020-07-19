var mongoose= require('mongoose');
var campground= require('./models/campground');
var Comment= require('./models/comment');

var data=[
	{
		name: "Cloud Rest",
		image: "https://www.visittnt.com/blog/wp-content/uploads/2018/01/Camping-in-Rajasthan-1.jpg",
		description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		name: "Deserted night",
		image: "https://i0.wp.com/www.rajasthandirect.com/wp-content/uploads/2012/11/Camping-in-Rajasthan.jpg?fit=680%2C300&ssl=1",
		description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		name: "FunkYard",
		image: "https://media-cdn.tripadvisor.com/media/photo-s/11/73/e1/83/funkyard-desert-camp.jpg",
		description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	}	
];

function seedDB(){
	campground.remove({}, function(err){
		if(err){
			console.log("err1");
		}else{
			console.log("removed campgrounds");
			//add few campgrounds
			data.forEach(function(seed){
			campground.create(seed, function(err, campg){
				if(err){
					console.log(err);
				}
				else{
					console.log("added a campground");
					Comment.create({
						text: "This is great!",
						author: "Ritesh"
					}, function(err, comment){
						if(err){
							console.log(err);
						}
						else{
							campg.comments.push(comment);
							campg.save();
							console.log("added comment");
						}
					});
					
					
				}
			});
		});
			
		}
	})
}

module.exports=seedDB;