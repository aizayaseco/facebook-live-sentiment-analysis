var currentPage = '';
var toCheck=false;
var continuing= false;

setInterval(function()
{
    if (currentPage != window.location.href)
    {
        // page has changed, set new page as 'current'
        currentPage = window.location.href;
        console.log(currentPage);
        toCheck=false;
        continuing= false;

        if(currentPage.indexOf("videos") >= 0){
            const vid_url = 'https://graph.facebook.com/v2.12/ID?QUERY';
            const local_url = 'https://localhost:8000';
            var access_token = null;
            const segmentSize = 10;
            var vid_id = window.location.pathname.split('/')[3];
            var vid_length = 0;
            var messages = [];
            var comments = [];
            var status=-1;
            var segmentIndex=-1;
            var segments=[];
            var segmentTimeUpperBound = new Array(segmentSize);
            var commentSize=0;
            var initialComment=null;
            var params = {}
            var page=currentPage
            var overallData = {
                emotions:{
                    happy: {
                        reactions:0,
                        comments: 0
                    },
                    sad: {
                        reactions: 0,
                        comments: 0
                    },
                    angry: {
                        reactions: 0,
                        comments: 0
                    },
                    amazed: {
                        reactions: 0,
                        comments: 0
                    },
                    neutral: {
                        comments: 0
                    }
                },
                total:{
                    reactions:0, 
                    comments:0 
                }
            }
            toCheck=false;
            continuing= false;

            if(currentPage.indexOf("vb.") >= 0 || currentPage.indexOf("pcb.") >= 0){
                vid_id = window.location.pathname.split('/')[4];
            }

            //check for comment and reaction updates         
            setInterval(function()
            {
                //check live status, new comments & get reactions
                 if(toCheck){
                    isLive(vid_id);
                }                    
            }, 30000);

            setInterval(function(){
                if(status!=-1){
                    var view=0;
                	var $element = jQuery('div#'+vid_id+' > form > div > div > div._1rgv') 
	                var $e = jQuery('div#'+vid_id+' > form > div > div > div._1rgv > div#circles')
	                var $b = jQuery('div#'+vid_id+' > form > div > div > div._1rgv > div#summarybuttons')
                    
                    if(!$element.length){
                        view=1;
                        $element= jQuery('div#stream_pagelet > div > div > div > div > div > div > div > div.userContent')
                        $e = jQuery('div#stream_pagelet > div > div > div > div > div > div > div > div.userContent > div#circles')
                        $b = jQuery('div#stream_pagelet > div > div > div > div > div > div > div > div.userContent > div#summarybuttons')
                        console.log(jQuery('div#stream_pagelet > div > div > div > div > div > div > div > div.userContent'));
                    }
	                
                    if($e.length){
	                    //update & getting of percentage
	                    var happy =0;
	                    var sad = 0;
	                    var angry = 0;
	                    var amazed = 0;
	                    var neutral = 0; 
	                    var timestamp ='';
	                    if(status==0 || segmentIndex==-1){
	                        var total = overallData.total.reactions+overallData.total.comments 
	                        if(total>0){
	                        	 happy = Math.round(((overallData.emotions.happy.reactions+overallData.emotions.happy.comments)/total)*100)
		                        sad = Math.round(((overallData.emotions.sad.reactions+overallData.emotions.sad.comments)/total)*100)
		                        angry = Math.round(((overallData.emotions.angry.reactions+overallData.emotions.angry.comments)/total)*100)
		                        amazed = Math.round(((overallData.emotions.amazed.reactions+overallData.emotions.amazed.comments)/total)*100)
		                        neutral = Math.round(((overallData.emotions.neutral.comments)/total)*100)
		                    	timestamp = '';
	                        }
	                    }else{
	                        total = segments[segmentIndex].total
	                        if(total>0){
	                            happy = Math.round(((segments[segmentIndex].emotions.happy)/total)*100)
	                            sad = Math.round(((segments[segmentIndex].emotions.sad)/total)*100)
	                            angry = Math.round(((segments[segmentIndex].emotions.angry)/total)*100)
	                            amazed = Math.round(((segments[segmentIndex].emotions.amazed)/total)*100)
	                            neutral =  Math.round(((segments[segmentIndex].emotions.neutral)/total)*100)
	                        }
	                        timestamp= segments[segmentIndex].timeRange
	                    }

                        var content='<div class="c100 p'+ happy+' small green">'+
                                '<span>'+happy+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="c100 p'+ sad+' small">'+
                                '<span>'+sad+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="c100 p'+ angry+' small red">'+
                                '<span>'+angry+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:green">HAPPY</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:blue">SAD</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:red">ANGRY</b>'+
                            '<div style="padding-left:40px">'+
                            '<div class="c100 p'+ amazed+' small orange">'+
                                '<span>'+amazed+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="c100 p'+ neutral+' small gray">'+
                                '<span>'+neutral+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '</div>'+
                            '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:orange">SURPRISED</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:gray">NEUTRAL</b>'+
                            '<div></div>'

                        var content1='<div><b style="color:green">HAPPY</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:blue">SAD</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:red">ANGRY</b>'+'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:orange">SURPRISED</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b style="color:gray">NEUTRAL</b></div>'+
                                '<center><div style="padding-left:70px"><div class="c100 p'+ happy+' small green">'+
                                '<span>'+happy+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="c100 p'+ sad+' small">'+
                                '<span>'+sad+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="c100 p'+ angry+' small red">'+
                                '<span>'+angry+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div style="padding-left:40px">'+
                            '<div class="c100 p'+ amazed+' small orange">'+
                                '<span>'+amazed+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="c100 p'+ neutral+' small gray">'+
                                '<span>'+neutral+'%</span>'+
                                '<div class="slice">'+
                                    '<div class="bar"></div>'+
                                    '<div class="fill"></div>'+
                                '</div>'+
                            '</div>'+
                            '</div></div></center>'+
                            '<div></div><br><br><br><br><br>'

                        if(view==0){
                            $e.html(content);    
                        }
                        if(view==1){
                            $e.html('<center>'+content1+'</center>');
                        }
	                    

	                        if(status==1 && $b.length > 0 ){
                                var content= '<div style="font-size:19px">'+timestamp+'</div>'+
                                    '<button id="b1" class="button '+segments[0].dominant+' data-inverted="" data-tooltip="'+segments[0].timeRange+'" data-position="top left" "></button>&nbsp'+
                                    '<button id="b2" class="button '+segments[1].dominant+' data-inverted="" data-tooltip="'+segments[1].timeRange+'" data-position="top left" "></button>&nbsp'+
                                    '<button id="b3" class="button '+segments[2].dominant+' data-inverted="" data-tooltip="'+segments[2].timeRange+'" data-position="top left" "></button>&nbsp'+
                                    '<button id="b4" class="button '+segments[3].dominant+' data-inverted="" data-tooltip="'+segments[3].timeRange+'" data-position="top left" "></button>&nbsp'+
                                    '<button id="b5" class="button '+segments[4].dominant+' data-inverted="" data-tooltip="'+segments[4].timeRange+'" data-position="top left" "></button>&nbsp'+
                                    '<button id="b6" class="button '+segments[5].dominant+' data-inverted="" data-tooltip="'+segments[5].timeRange+'" data-position="top left" "></button>&nbsp'+
                                    '<button id="b7" class="button '+segments[6].dominant+' data-inverted="" data-tooltip="'+segments[6].timeRange+'" data-position="top left" "></button>&nbsp'+
                                    '<button id="b8" class="button '+segments[7].dominant+' data-inverted="" data-tooltip="'+segments[7].timeRange+'" data-position="top left" "></button>&nbsp'+
                                    '<button id="b9" class="button '+segments[8].dominant+' data-inverted="" data-tooltip="'+segments[8].timeRange+'" data-position="top right" "></button>&nbsp'+
                                    '<button id="b10" class="button '+segments[9].dominant+' data-inverted="" data-tooltip="'+segments[9].timeRange+'" data-position="top right" "></button>'+
                                    '<button id="b11" class="overall data-inverted="" data-tooltip="Overall Mood Meter" data-position="top right" "></button>'
                                    var content1='<center>'+content+'</center>';
	                            if(view==0){
                                    $b.html(content);    
                                }
                                if(view==1){
                                    $b.html(content1);
                                }
	                            for(i=0;i<segmentSize;i++){
	                                let button = document.getElementById('b'+(i+1));
	                                button.onclick = function() {
	                                    var value = parseInt((button.id).replace("b",""))
	                                    segmentIndex = value-1;
	                                };                       
	                           }
	                           let button =  document.getElementById('b11');
	                           button.onclick = function() {
	                                segmentIndex = -1;
	                            };
	                        }
	                }
	                else if($element.length){
	                    //initializing front-end elements
	                    $element.append(
	                        '<br><br><div style="padding-left: 40px" id="circles">'+
	                        '</div>'+
	                        '<br>');
	                    if(status==1){
	                        segments[0].dominant
	                        $element.append(
	                            '<div id="summarybuttons">'+
	                            '</div>'
	                        ); 
	                    }       
               		}
            	}
            },3000)

            let init = function(vid_id) {
                $.ajax({
                    method: 'GET',
                    url: local_url + '/api/token'
                }).done(function(data){
                    console.log("Done");
                    access_token= data.access_token;
                    isLive(vid_id);
                }).fail(function(jqXHR,textStatus, error) {
                    console.log(jqXHR.responseText);
                    console.log(textStatus);
                    console.log(error);
                    init(vid_id);
                }) 
            }

             let getAToken = function() {
                $.ajax({
                    method: 'GET',
                    url: local_url + '/api/token'
                }).done(function(data){
                    console.log("Done");
                    console.log(data);
                    access_token= data.access_token;
                   console.log("DONE GETTING access_token");
                   console.log(access_token);
                }).fail(function(jqXHR,textStatus, error) {
                    console.log(jqXHR.responseText);
                    console.log(textStatus);
                    console.log(error);
                    if(status!=-1)
                    	getAToken();
                }) 
            } 

            let coninueGettingComments = function(){
                if(params.getterType==0 && page==currentPage){
                    comments = []
                    initialCommentGetter(vid_id,params.after_id,params.type);
                }
                if(params.getterType==1 && page==currentPage){
                    comments = []
                    newCommentsGetter(vid_id,params.since_id,params.after_id,params.type,params.initial_comment)
                }
            }

            let svmAnalyze = function(type,comments) {
             	const cont = continuing;
                $.ajax({
                    method: 'POST',
                    url: local_url + '/api/svm',
                    data: {"data": JSON.stringify(comments)}
                }).done(function(data) {
                    console.log("Done SVM");
                    if(data!=null || data!='' || data.length>0){
                       
                        data = JSON.parse(data)
                        messages=[]
                        //change counts of the global var
                        data.forEach(function(e, index) {
                            if(status==1 && segments.length > 0 && (e.svm.length>0 || e.svm!='')){     
                                if(e.timestamp==undefined || e.timestamp<=segmentTimeUpperBound[0]){
                                    segments[0]['emotions'][e.svm]+=1;
                                    segments[0]['total']+=1;
                                }
                                else{
                                    for(j=1;j<segmentSize;j++){
                                        if(e.timestamp <= segmentTimeUpperBound[j]){
                                            segments[j]['emotions'][e.svm]+=1;
                                            segments[j]['total']+=1; 
                                            break;
                                        }
                                    }
                                }
                        	}
                        	if((e.svm.length>0 || e.svm!=="") && overallData['emotions'][e.svm]!== undefined){
                        		overallData['emotions'][e.svm]['comments']+=1;
                        		overallData['total']['comments']+=1;
                        	}                        	
                        });
                        if(status==1 && segments.length > 0){
                            for(j=0;j<segmentSize;j++){
                                var max=0;
                                dom = ''
                                for (var key in segments[j]['emotions']) {
                                    if (segments[j]['emotions'].hasOwnProperty(key)) {
                                        if(max < segments[j]['emotions'][key]){
                                            max = segments[j]['emotions'][key]
                                            dom =  key  
                                        }
                                    }
                                }
                                segments[j]['dominant'] = dom 
                            }
                        } 
                    }
                    if(cont)
                        coninueGettingComments();
                    else{
                    	if(currentPage==window.location.href)
                    		toCheck=true;
                    }
                        
                }).fail(function(jqXHR,textStatus, error) {
                	if(status!=-1)
                    	svmAnalyze(vid_id,comments);
                    console.log(jqXHR.responseText);
                    console.log(textStatus);
                    console.log(error);

                })
            }

            let updateOverallReactions = function(data){
                overallData.emotions.happy.reactions = data['reactions_haha']['summary']['total_count'];
                overallData.emotions.sad.reactions = data['reactions_sad']['summary']['total_count'];
                overallData.emotions.angry.reactions = data['reactions_angry']['summary']['total_count'];
                overallData.emotions.amazed.reactions = data['reactions_wow']['summary']['total_count'];
                overallData.total.reactions = overallData.emotions.happy.reactions+ overallData.emotions.sad.reactions + overallData.emotions.angry.reactions + overallData.emotions.amazed.reactions;
            }

            let timestampGetter = function(){
                toCheck=false;
                var length = comments.length
                comments.forEach(function(e, index) {
                    let query='fields=live_broadcast_timestamp'
                     $.ajax({
                        //getting of all the current comments
                        method: 'GET',
                        url: vid_url.replace('ID', e.id).replace('QUERY',query),
                        data: { 
                            'access_token': access_token
                        }
                    }).fail(function(jqXHR){
                        console.log(JSON.stringify(jqXHR));
                        if(jqXHR.readyState == 4 && status!=-1){
                            getAToken();
                            timestampGetter();
                        }
                    }).done(function(data) {
                        e.timestamp= data['live_broadcast_timestamp']; //this is the timestamp
                        if(index==length-1){
                            console.log("Comments with timestamp")
                            svmAnalyze(1,comments);
                        }
                    });
                });
            }

            let newCommentsGetter = function(vid_id,since_id,after_id,type,initial_comment){ 
            	toCheck= false;
                let primaryQuery= '/comments'
                let query='order=reverse_chronological&limit=50'+since_id+after_id;
                $.ajax({
                    //getting of all the succeeding comments of the videos
                    //&since will be appended by &after
                    method: 'GET',
                    url: vid_url.replace('ID', vid_id+primaryQuery).replace('QUERY',query),
                    data: { 
                        'access_token': access_token
                    }
                }).fail(function(jqXHR){
                    console.log(JSON.stringify(jqXHR));
                    if(jqXHR.readyState == 4 && status!=-1){
                        getAToken();
                        newCommentsGetter(vid_id,since_id,after_id,type,initial_comment);
                    }
                }).done(function(data) {
                    var BreakException = {};
                    var toHalt=false;
                    try{
                        data['data'].forEach(function(e, index) {     
                            if(initial_comment.id===e.id){
                                since_id=''
                                toHalt=true;
                                throw BreakException;
                            }
                            //getInitial comment (topmost)
                            if(index==0 && continuing==false){  
                                initialComment={
                                    "id":e.id,
                                    "time": e.created_time
                                }   
                            }
                            comment = {
                                "message":e.message,
                                "id":e.id
                            }
                            messages.push({"message": e.message});
                            comments.push(comment);
                        });
                    }catch(e){
                        if (e !== BreakException) throw e;
                    }
                    
                    if(!toHalt && comments.length!==0 && data['data'].length !==0 && data['paging']['cursors']['after']!==undefined && data['paging']['next']!==undefined){
                        after_id='&after='+data['paging']['cursors']['after']; 
                        continuing=true;
                        params ={}
                        params.getterType=1;
                        params.since_id=since_id;
                        params.after_id=after_id;
                        params.type= type;
                        params.initial_comment=initial_comment;
                        if(type==0)
                            svmAnalyze(type,comments);
                        if(type==1)
                            timestampGetter();
                    }
                    else{
                        continuing=false;
                         if(type==0)
                            svmAnalyze(type,comments);
                        if(type==1)
                            timestampGetter();
                    }    

                });
            }


            let initialCommentGetter = function(vid_id,after_id,type){
                if(commentSize>100){
                    commentSize=100;
                }
                let primaryQuery= '/comments'
                let query='order=reverse_chronological'+'&limit='+commentSize+after_id;
                $.ajax({
                    //getting of all the current comments of the videos
                    method: 'GET',
                    url: vid_url.replace('ID', vid_id+primaryQuery).replace('QUERY',query),
                    data: { 
                        'access_token': access_token
                    }
                }).fail(function(jqXHR){
                    console.log(JSON.stringify(jqXHR));
                    if(jqXHR.readyState == 4 && status!=-1){
                    	getAToken();
                    	initialCommentGetter(vid_id,after_id,type);
                    }
                }).done(function(data) {
                    data['data'].forEach(function(e, index) {
                        //getInitial comment (topmost)
                        if(index==0 && after_id===''){
                            initialComment={
                                "id":e.id,
                                "time": e.created_time
                            }
                        }
                        comment = {
                            "message":e.message,
                            "id":e.id
                        }
                        messages.push({"message": e.message});
                        comments.push(comment);
                    });    
                    if(comments.length!==0 && data['data'].length !==0 && data['paging']['cursors']['after']!==undefined && data['paging']['next']!==undefined){
                        aft_id='&after=' + data['paging']['cursors']['after']; 
                        continuing=true;
                        params ={}
                        params.getterType=0;
                        params.after_id=aft_id;
                        params.type= type;
                        //analyze already if large 
                        if(type==0)
                            svmAnalyze(type,comments);
                        if(type==1)
                            timestampGetter();
                    }else{
                        continuing=false;
                         if(type==0)
                            svmAnalyze(type,comments);
                        if(type==1)
                            timestampGetter();
                    }
                });
                
            }

            // Checks if the video id is live or not. Proceeds to getting of comments depending on the type of live video.
            //gets total comment count and reaction count beforehand
            let isLive= function(vid_id){
                let query='fields=live_status,length,comments.limit(0).summary(total_count),reactions.type(WOW).limit(0).summary(total_count).as(reactions_wow),reactions.type(HAHA).limit(0).summary(total_count).as(reactions_haha),reactions.type(SAD).limit(0).summary(total_count).as(reactions_sad),reactions.type(ANGRY).limit(0).summary(total_count).as(reactions_angry)';
                $.ajax({
                    method: 'GET',
                    url: vid_url.replace('ID', vid_id).replace('QUERY',query),
                    data: { 
                        'access_token': access_token
                    }
                }).fail(function(jqXHR){
                    //the video does not exists
                    console.log(JSON.stringify(jqXHR));
                    alert(jqXHR.responseText.error.message)
                     if(jqXHR.readyState== 4 && status!=-1){
                 		getAToken();
                    	isLive(vid_id);	
                    }
                }).done(function(data) {
                    if(data['length']!==undefined){
                        vid_length = data['length']
                    }

                    commentSize=data['comments']['summary']['total_count'];

                    //update overall data reactions
                    updateOverallReactions(data);

                    if(data['live_status']!==undefined){
                        var type=-1;
                        if(data['live_status']==='LIVE')
                            type=0;
                        else{
                            type=1;
                            //creation of array
                            let added = vid_length/segmentSize;
                            var prev = 0;
                            var curr = 0;
                            if(segments.length==0 && added>0){
                                for(i=0;i<segmentSize;i++){
                                	//creation of time range
                                	curr = (added*(i+1))
	                            	var h = Math.floor(curr / 3600);
									
									var m = Math.floor(curr % 3600 / 60);
									var s =  Math.floor(curr % 3600 % 60);
									var scurr = (h > 0 ? "0"+h+":" : "") +  (m > 9 ? m+":" : "0"+m+":") + (s > 9 ? s : "0"+s);

	                            	h = Math.floor(prev / 3600);
									
									m = Math.floor(prev % 3600 / 60);
									s =  Math.floor(prev % 3600 % 60);
									var sprev = (h > 0 ? "0"+h+":" : "") +  (m > 9 ? m+":" : "0"+m+":") + (s > 9 ? s : "0"+s);

                                    segments.push({
                                        emotions:{
                                            happy:0,
                                            sad:0,
                                            angry:0,
                                            amazed:0,
                                            neutral:0
                                        },
                                        total: 0,
                                        dominant:'',
                                        timeRange: sprev +"-"+scurr
                                    })
                                    segmentTimeUpperBound[i] = curr
                                    prev = curr+1;
                                }
                            }                           
                        }
                        
					    //comment getter
                        var after_id='';
                        if(status == -1){
                            status = type;
                        }

                        if(toCheck && type!=status){
                            console.log("REFRESH");//refresh //debug
                            status =-1;
                            toCheck=false;
                        }
                        else if(toCheck){
                            toCheck=false;
                            since_id='';
                            if(initialComment!==null || initialComment['time']!==null){
                            	since_id='&since='+  Math.round((new Date(initialComment['time'])).getTime() / 1000);
                           	}
                            after_id='';
                            comments=[];
                            var comment=JSON.parse(JSON.stringify(initialComment));;
                            newCommentsGetter(vid_id,since_id,after_id,type,comment);
                        }
                        else
                            initialCommentGetter(vid_id,after_id,type);
                    }
                    else{
                        toCheck=false;
                        continuing=false;
                        status =-1;
                        console.log("The video is a regular video");
                    }
                });
            }

            init(vid_id);
        }
    }
}, 500);