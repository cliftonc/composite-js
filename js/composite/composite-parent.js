/**
 
 The MIT License

 Copyright (c) 2010 Clifton Cunningham (http://cliftoncunningham.co.uk)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 
 **/
 
var _parent = {
  events: _defaultEventManager,
  init: function(o) {
  
     _parent.events = _parentEventManager;
  
     // UI Calls
     $.composite.UI = _ParentUI;              
    
    // Link to the div for applications to be added
    _parent.appFrame = o.appFrame;
    
    // Update our logged in status
    _parent.status();
    
    // Bind Events        
    $.pm.bind("login", function(data) {
      return _parent.login(data);
    });
    
    $.pm.bind("status", function(data) {                  
      return {user:_parent.user};
    });
    
    
    $.pm.bind("error", function(data) {                  
      alert("ERROR!");
    });
    
    $.pm.bind("child.init", function(data) {
    
        console.log("parent received child init for " + data.id);

        var frame = $("iframe#" + data.id);                
        _parent.children.push(data.id);
        _parent.event({id:data.id,type:"style",css:frame.attr("applycss")});                        
        frame.show();
      
    });
    
    
    $.pm.bind("logout", function() {
      return _parent.logout();
    });
    
    $.pm.bind("UI-user", function(data) {
      return _ParentUI.user(data);
    });
        
    console.log("parent mode initialised " + o.domain);
    
  },      
  status: function() {
            
    _parent.events.status.event();
    
  },
  appFrame: null,
  addChild: function(id,name,src,css) {    
  
    if(!$('iframe#' + id).length) {          
      
      _parent.appFrame.append('<iframe class="app-iframe" id="' + id + '" src="' + src + '" style="display:none"/>');
      
      var newFrame = $('iframe#' + id);           
      newFrame.attr("class","composite-child");
      newFrame.attr("applycss",css);
                          
      newFrame.load(function() {    
        newFrame.hide();
        newFrame.show();
      });                  
      
    };
    
  },
  removeChild: function(id) {
    
    var child = $('iframe#' + id);
    var remainingChildren = []
    
    for (c in _parent.children)
    {          
      if(_parent.children[c] === id) {
        // Ignore
        console.log(_parent.children[c])
      } else {
        remainingChildren.push(_parent.children[c]);
      }
    };        
    
    _parent.children = remainingChildren;
    child.remove();        
  },
  removeAllChildren: function() {    
    _parent.appFrame.empty();        
    _parent.children = [];
  },
  children:[],      
  login: function(data) {    
      if(_parent.user) {          
        _parent.event({type:"login.repeat",user:data.user});
      } else {    
        _parent.events.login.event(data);                       
      }                    
      
   },
   logout: function() {
      _parent.events.logout.event();                            
   },
   event: function(eventData) { 
    
    console.log(eventData);
    console.log(_parent.children);

    for (c in _parent.children)
    {                  
      
      $.pm({
          target: window.frames[c],
          type: eventData.type + ".event", 
          data: eventData,          
          error: function fn(err) {
            _parent.genericError(err);
          }
      });                       
    }
      
   },
   genericError: function(err) { 
      _parent.appFrame.empty();
      _parent.appFrame.append("<div class='apps.error'>There was an error returned: <i>" + JSON.stringify(err) + "</i></div>");
   },
   user: null    
   
};

 
/* You need to implement an event manager to over-ride these actions. */
var _parentEventManager = {   
  login: {
    event: function(data) {
        $.getJSON('login.php', {user:data.user}, function(response) {          
          _parent.user = data.user;        
          $('#user-panel').show();
          $('#user-detail').append(data.user);
          $('#login-panel').hide();
          _parent.event({type:"login",user:data.user});
        });                              
    },
    success: function() {},
    error: function() {}
  },
  logout:  {
    event: function() {        
       $.getJSON('logout.php', function(response) {          
         $('#user-panel').hide();
         $('#user-detail').empty();
         $('#login-panel').show();                   
         _parent.event({type:"logout",user:_parent.user});
         _parent.user = null;
      });  
    },
    success: function() {},
    error: function() {}
  },      
  status:  {
    event: function() {
    
      if(_parent.user == null) {                                        
            _parent.user = "clifton";
            $('#user-detail').append(_parent.user);
            $('#user-panel').show();
            $('#login-panel').hide();                
      } 
      
    },
    success: function() {},
    error: function() {}
  },
  style: {      
    event: function() {}
  },
  event: function(data) {},
  UI: {
    chat: function() {},
    user: function(data) {
               
       $( "#dialog-message" ).html(data.user);       
       $( "#dialog-message" ).dialog({
	   title: "Modal Dialog on Parent",
          modal: true,
          buttons: {
            Ok: function() {
              $( this ).dialog( "close" );
            }
          }
        });
       return {status:"ok"};
    
    }         
  }
  
};
