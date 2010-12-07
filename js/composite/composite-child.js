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
   
var _child = {
  id:null,
  events: _defaultEventManager,
  init: function(o) {
    
     _child.events = _childEventManager;        
    
     // store the id
     _child.id = o.id;
     
     // Link up UI Calls
     $.composite.UI = _ChildUI;              
     
     $.pm.bind("style.event", function(data) {                                                        
      _child.events.style.event(data);
     }, o.parentDomain);
      
     $.pm.bind("login.event", function(data) {
      _child.events.login.event(data);
     }, o.parentDomain); 
     
    $.pm.bind("logout.event", function(data) {
       _child.events.logout.event(data);
     }, o.parentDomain);              
      
     $.pm.bind(".event", function(data) {
      _child.events.event(data);
     }, o.parentDomain);            
                    
    // Phone home!
    $.pm({
        target: window.parent,
        type:"child.init", 
        data:{id:_child.id}, 
        success: function(data) {          
        },
        url: document.referrer
    });                       

     console.log("child mode initialised " + o.domain);  
    
  },
   login: function(data) {
     
    // Send a login message to the parent
    $.pm({
        target: window.parent,
        type:"login", 
        data:{user:data.user}, 
        success: function(data) {
        _child.events.login.success(data);                          
        },
        url: document.referrer
    });                       
      
   },
   logout: function() {
    // Send a logout message to the parent
    $.pm({
        target: window.parent,
        type:"logout", 
        data:{}, 
        success: function(data) {
        // Logout success?  
        _child.events.logout.success(data);                                      
        },
        url: document.referrer
    });                       
             
    return true;
   }
   ,user:null
   ,status: function() {
    
    // Retrieve the logged in status from the parent
    // Store into user field
    
    $.pm({
        target: window.parent,
        type:"status", 
        data:{}, 
        success: function(data) {
        console.log("received status from parent: " + data.user);
        if(data.user) {              
          _child.user = data.user;
          _child.events.status.success(data);                                      
        } else {
          _child.user = null;                
        }                        
        },
        url: document.referrer
    });                 
  
   }
   
};

/* You need to implement an event manager to over-ride these actions. */
var _childEventManager = {   
  login: {
    event: function() {
      console.log("login");
      $("#content").show();  
      return true;
    },
    success: function() {},
    error: function() {}
  },
  logout:  {
    event: function() {
      console.log("logout");
      $("#content").hide();                   
       return true;           
    },
    success: function() {},
    error: function() {}
  },      
  status:  {
    event: function() {},
    success: function(data) {          
      $('#content').show();
    },
    error: function() {}
  },
  event: function(data) {      
    $("#msg").append('<pre class="code code-success">' + JSON.stringify(data, null, 2) + '</pre>');         
    return true;          
  },
  style: {      
    event: function(data) {
        
        console.log("received style event" + data.id + " " + _child.id);

        // If the event is for this child
        if(data.id === _child.id) { 
          
          _child.status();
                                
          $('<link rel="stylesheet" type="text/css" href="'+data.css+'" >')
            .appendTo("head");
          
          // Hide the application stuff
          $("#header").hide();
          $("#footer").hide();
                      
          $('.composite-user').click(function(e) {                  
            $.composite.UI.user({user:e.currentTarget.innerHTML});                  
            return false;
          });              
        }
        
        return true;
    }
  },
  UI: {
    chat: function() {},
    user: function(data) {
      $.pm({
          target: window.parent,
          type:"UI-user", 
          data:data, 
          success: function(data) {
          $("#msg").append('<pre class="clear code code-success">' + JSON.stringify(data, null, 2) + '</pre>');;
          },
          url: document.referrer
      });     
    }         
  }
};
