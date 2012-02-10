/* init.js */
function showLogin() { $('#logindata').modal('show'); $('#uname').focus(); }

function loadDrafts() {
  $.post("/api/drafts", {}, function(data) {
    $('#draftsmodal .modal-body').removeClass('loading-body');
    data = JSON.parse(data);
    $('#draftsmodal .modal-body').html('<p>You have stored <strong>' + data.length + ' unpublished drafts</strong>. When logged in you can preview unpublished posts and use the built-in composer for editing, please choose an article:</p>');
    $('#draftsmodal .modal-body').append($('<table class="zebra-striped"><tbody></tbody></table><p>For permanently removing articles you have to manually delete the markdown file on your server and either restart node-blog or <a href="">refresh your data…</a></p>'));
    for (var i = 0; i < data.length; i++) {
      $('#draftsmodal tbody').append($('<tr><td class="span1"><code>' + data[i].id + '</code></td><td><a href="' + data[i].url + '">' + data[i].name + '</a></td></tr>'));
    }
  });
}

/** Ace Editor for editing Articles **/
var editor = null;
var editMode = function() {
  if ($('#articlerow').length > 0) {
    $('<div id="articleeditor" style="display: none; height: 480px;"><div class="row" id="articleeditframe" style="height: 448px; opacity: 0;"><div class="span16"><div id="edit" style="width:935px; height:450px">' + $('#articlemarkdown').html() + '</div><br style="clear:both" /></div></div><hr /></div>').insertBefore('#articlerow');
    $('<div class="github pull-right"><a href="#" class="btn" id="composesave">Save</a><a href="#" id="composepreview" class="btn primary" style="margin-left: 10px;">Preview</a></div>').insertBefore('h1');
    $('.time, .read, #editMode').remove();
    
    var converter = new Showdown.converter(), text = '';
    $('#logindata').bind('show', function() { $('#uname').focus(); });
    $('#composesave').click(function(e) { 
      e.preventDefault();
      $.post(location.href, { data: editor.getSession().getValue() }, function(data) { location.reload(); });
    });
    
    $("#composepreview").click(function(e) {
      e.preventDefault();
      var contentList = editor.getSession().getValue().split('*/');
      var header = contentList.shift();
      var content = contentList.join('*/');
      var text = converter.makeHtml(content);
      $('#preview').html(text);
    });
    
    $("#articleeditor").slideDown(400, function() {
      editor = ace.edit("edit");
      var mdMode = require("ace/mode/markdown").Mode;
      editor.getSession().setMode(new mdMode());
      editor.setTheme("ace/theme/clouds");
      editor.getSession().setUseSoftTabs(true);
      editor.getSession().setUseWrapMode(true);
      editor.getSession().setWrapLimitRange(130, 130);
      editor.renderer.setShowGutter(false);
      editor.renderer.setPrintMarginColumn(135);
      $('#articleeditframe').fadeTo(300, 1, function() {} );
    }); }

  return true;
};

$(document).ready(function() { 
  $("abbr.timeago").timeago();
  
  /** Add Event to Edit Button **/
  if ($('#editMode').length > 0) {
    $('#editMode').click(function(e) { e.preventDefault(); editMode(); }); }

  /** Add Events to Administration Menu Items **/  
  if ($('#buttoncompose, #buttondrafts, #login').length > 0) {
    $('#buttoncompose').click(function(e) { e.preventDefault(); if (!auth) { showLogin('compose'); } else { $('#composemodal').modal('show'); $('#ntitle').focus(); }});
    $('#buttondrafts').click(function(e) { e.preventDefault(); if (!auth) { showLogin('drafts'); } else { $('#draftsmodal').modal('show'); loadDrafts(); }});
    $('#login').click(function(e) { e.preventDefault(); showLogin(); });
    $('#logout').click(function(e) { e.preventDefault(); $.post("/api/logout", { }, function(data) { location.reload(); }); } );
    
    /** Create Article Handling **/
    $('#composecreate').click(function(e) {
      e.preventDefault();      
      $('#composestatus').css('display', 'block').removeClass('failed').removeClass('done').addClass('loader');
      $.post("/api/new", { pid: $('#npid').val(), name: $('#ntitle').val() }, function(data) {
        if (data == '0') {
          $('#composestatus').html("Failed to create article!");
          $('#composestatus').removeClass('loader').removeClass('done').addClass('failed'); }
        else {
          $('#composestatus').html("Article created, Please wait!");
          $('#composestatus').removeClass('loader').removeClass('failed').addClass('done');
          window.setTimeout('location.href = "/' + data + '.html";', 500); }
      });
    });
    
    /** Authentication Handling **/
    $('#authenticate').click(function(e) {
      e.preventDefault();
      $('#loginstatus').css('display', 'block').removeClass('failed').removeClass('done').addClass('loader');
      $.post("/api/auth", { name: $('#uname').val(), password: $('#pword').val() }, function(data) {
        if (data == '1') {
          $('#loginstatus').html("Login done, Please wait!");
          $('#loginstatus').removeClass('loader').removeClass('failed').addClass('done');
          window.setTimeout('location.reload()', 500); }
        else {
          $('#loginstatus').html("Login failed!");
          $('#loginstatus').removeClass('loader').removeClass('done').addClass('failed'); }
      });
    }); }
});