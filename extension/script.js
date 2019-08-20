var currentPage = '';
var toCheck=false;

setInterval(function()
{
    if (currentPage != window.location.href)
    {
        // page has changed, set new page as 'current'
        currentPage = window.location.href;
        console.log(currentPage);
        toCheck=false;

        if(currentPage.indexOf("videos") >= 0){
            const vid_url = 'https://graph.facebook.com/v2.12/ID?QUERY'
            const local_url = 'https://localhost:8000';
            var access_token = null;
            const segmentSize = 10;
            var vid_id = window.location.pathname.split('/')[3];
            var messages = [];
            var comments = [];
            var status=-1;
            var segments=[];
            var segmentTimeUpperBound = new Array(segmentSize);
            var commentSize=0;
            var initialComment=null;
            var continuing= false;
            var params = {}
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
                    reactions:0, //excluding "LIKE" and "HEART"
                    comments:0  //total analyzed excluding unclassififed
                }
            }
            toCheck=false;
            if(currentPage.indexOf("vb.") >= 0 || currentPage.indexOf("pcb.") >= 0){
                vid_id = window.location.pathname.split('/')[4];
            }


            //check for comment and reaction updates         
            setInterval(function()
            {
                //check live status & get reactions
                //check if there's new
                //stops checking if entered svm
                //continue checking if front-end is rendered
                 if(toCheck){
                    isLive(vid_id);
                }                    
            }, 30000);
            

            console.log(window.location.pathname.split('/'));
            console.log(window.location.pathname.split('/').length);
            console.log(vid_id);

            let init = function(vid_id) {
                $.ajax({
                    method: 'GET',
                    url: local_url + '/token'
                }).done(function(data){
                    console.log("Done");
                    console.log(data);
                    access_token= data.access_token;
                   console.log("DONE GETTING access_token");
                   console.log(access_token);
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
                    url: local_url + '/token'
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
                    getAToken();
                }) 
            } 

            let coninueGettingComments = function(){
                if(params.getterType==0){
                    initialCommentGetter(params.vid_id,params.after_id,params.type);
                }
                if(params.getterType==1){
                    newCommentsGetter(params.vid_id,params.since_id,params.after_id,params.type,params.initial_comment)
                }
            }

            let svmAnalyze = function(vid_type,comments) {
                console.log(comments);
                //console.log(overallData);
                //console.log(comments.length);
                console.log("Entered SVM");
                $.ajax({
                    method: 'POST',
                    url: local_url + '/svm',
                    data: {
                        'data': JSON.stringify(messages), 
                        'type': vid_type
                    }
                }).done(function(data) {
                    console.log("Done");
                    console.log(data);
                    messages=[]
                    comments=[]
                    if(continuing)
                        coninueGettingComments();
                    else
                        toCheck=true;
                }).fail(function(jqXHR,textStatus, error) {
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
                console.log(initialComment);
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
                        if(jqXHR.readyState == 4){
                            getAToken();
                            timestampGetter();
                        }
                    }).done(function(data) {
                        e.timestamp= data['live_broadcast_timestamp']; //this is the timestamp
                        if(index==length-1){
                            var new_comments = JSON.parse(JSON.stringify(comments));
                            console.log("Comments with timestamp")
                            console.log(new_comments)
                            svmAnalyze(2,new_comments);
                            //console.log(overallData);
                        }
                    });
                });
            }

            let newCommentsGetter = function(vid_id,since_id,after_id,type,initial_comment){ 
                let primaryQuery= '/comments'
                let query='order=reverse_chronological&limit=50'+since_id+after_id;
                console.log(query)
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
                    if(jqXHR.readyState == 4){
                        getAToken();
                        newCommentsGetter(vid_id,since_id,after_id,type,initial_comment);
                    }
                }).done(function(data) {
                    var BreakException = {};
                    try{
                        data['data'].forEach(function(e, index) {     
                            if(initial_comment.id===e.id){
                                toCheck=true;
                                console.log("ENTERED HERE in same comments")
                                since_id=''
                                toHalt=true;
                                throw BreakException;
                            }
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
                    }catch(e){
                        if (e !== BreakException) throw e;
                    }
                    
                    if(data['data'].length !==0 && data['paging']['cursors']['after']!==undefined && data['paging']['next']!==undefined){
                        after_id='&after='+data['paging']['cursors']['after']; 
                        continuing=true;
                        params ={}
                        params.getterType=1;
                        params.vid_id=vid_id;
                        params.since_id=since_id;
                        params.after_id=after_id;
                        params.type= type;
                        params.initial_comment=initial_comment;
                        if(type==0)
                            svmAnalyze(type,comments);
                        if(type==1)
                            timestampGetter();
                        console.log("entered again");
                    }

                    if(comments.length!==0 && data['paging']['next']==undefined){
                        continuing=false;
                        if(type==0)
                            svmAnalyze(type,comments);
                        if(type==1)
                            timestampGetter();
                    }else{
                        continuing=false;
                        toCheck=true;
                    }       

                    console.log("NEW COMMENTS");
                    console.log(overallData);
                    console.log(comments); //getting the last after would be good

                });
            }


            let initialCommentGetter = function(vid_id,after_id,type){
                console.log("ENTERED HERE")
                if(commentSize>50){
                    commentSize=50;
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
                    if(jqXHR.readyState == 4){
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
                    console.log(data['data'].length);
                    if(data['data'].length !==0 && data['paging']['cursors']['after']!==undefined && data['paging']['next']!==undefined){
                        aft_id='&after=' + data['paging']['cursors']['after']; 
                        continuing=true;
                        params ={}
                        params.getterType=0;
                        params.vid_id=vid_id;
                        params.after_id=aft_id;
                        params.type= type;
                        //analyze already if large 
                        if(type==0)
                            svmAnalyze(type,comments);
                        if(type==1)
                            timestampGetter();
                        console.log("entered again");
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
                let query='fields=live_status,comments.limit(0).summary(total_count),reactions.type(WOW).limit(0).summary(total_count).as(reactions_wow),reactions.type(HAHA).limit(0).summary(total_count).as(reactions_haha),reactions.type(SAD).limit(0).summary(total_count).as(reactions_sad),reactions.type(ANGRY).limit(0).summary(total_count).as(reactions_angry)';

                $.ajax({
                    method: 'GET',
                    url: vid_url.replace('ID', vid_id).replace('QUERY',query),
                    data: { 
                        'access_token': access_token
                    }
                }).fail(function(jqXHR){
                    //the video does not exists
                    console.log(JSON.stringify(jqXHR));
                     if(jqXHR.readyState== 4){
                        getAToken();
                        isLive(vid_id);
                    }
                }).done(function(data) {
                    console.log("LIVE VIDEO RESULT");
                    console.log(data);

                    commentSize=data['comments']['summary']['total_count'];
                    console.log(commentSize);

                    //update overall data reactions
                    updateOverallReactions(data);

                    if(data['live_status']!==undefined){
                        var type=-1;
                        if(data['live_status']==='LIVE')
                            type=0;
                        else
                            type=1;
                        

                        if(status == -1){
                            status = type;
                        }
                        //comment getter
                        let after_id='';
                        if(toCheck && type!=status){
                            console.log("REFRESH");//refresh
                            toCheck=false;
                        }
                        else if(toCheck){
                            since_id='&since='+  Math.round((new Date(initialComment['time'])).getTime() / 1000);
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
                        console.log("The video is a regular video");
                    }
                });
            }

            init(vid_id);
        }
    }
}, 500);