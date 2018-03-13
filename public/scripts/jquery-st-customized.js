// JavaScript Document
$(document).ready(function(e) {
  // NOTIFY
  // $('.st-occ-panel-callput').on('click', '.st-notify-action-call', function(e) {
  // 	UIkit.notify({
  // 		message : '<i class="st-fonticon-trade-call"></i> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque in neque id justo auctor dignissim in id dolor.',
  // 		timeout : 5000,
  // 		status  : 'success'
  // 	});
  // 	return false;
  // });
  // $('.st-occ-panel-callput').on('click', '.st-notify-action-put', function(e) {
  // 	UIkit.notify({
  // 		message : '<i class="st-fonticon-trade-put"></i> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque in neque id justo auctor dignissim in id dolor.',
  // 		timeout : 5000,
  // 		status  : 'danger'
  // 	});
  // 	return false;
  // });

  // OPTION CHART CONTROLS TOGGLE
  $(".st-occ-toggle-cont-body, .st-offcanvas-body").on(
    "click",
    ".st-list-clickable > li",
    function(e) {
      $(this).addClass("uk-active");
      $(this)
        .siblings()
        .removeClass("uk-active");
      var isgreen = $(this).hasClass("st-list-userbalance-real");
      $("div.st-userbalance-button > span").css(
        "color",
        isgreen ? "#46b06a" : "#bdaa15"
      );
    }
  );

  $(".add-symbol").on("click", function() {
    $("#assetLabel").text("Open New Asset");
    $("#st-add-asset").data("Functionality", false);
    $('[class*="st-sidebar-nav-mcont"] > .uk-icon-close').click();
  });

  $("#assetLabel").text("Change Asset");

  //  RESPONSIVE MAIN MENU
  $(".at-btn-open").on("click", function() {
    var $contentfadeIn = $(".overlay-menu-mcont").addClass("animated fadeIn");
    var $contentfadeOutDone = $(".overlay-menu-mcont").removeClass("fadeOut");

    $(".at-btn-close").css("visibility", "visible");
    $("body").addClass("overlay-menu-active");

    setTimeout(function() {
      $contentfadeIn.css("display", "block");
    }, 0);
  });
  $(".at-btn-close").on("click", function() {
    var $contentfadeOut = $(".overlay-menu-mcont").addClass("animated fadeOut");
    var $contentfadeInDone = $(".overlay-menu-mcont").removeClass("fadeIn");

    $(this).css("visibility", "hidden");
    $("body").removeClass("overlay-menu-active");

    setTimeout(function() {
      $contentfadeOut.css("display", "none");
    }, 900);
  });

  // OPTION CHART CONTROLS TOGGLE
  var sec = $("section");
  sec.on("click", '[class*="st-occ-toggle-button"]', togglecanvas);
  //$('[class*="st-occ-toggle-button"]').click();
  function togglecanvas(e) {
    $(".st-occ-toggle-mcont")
      .addClass("st-occ-toggle-mcont-active")
      .removeClass("st-occ-toggle-mcont-inactive")
      .stop();

    if ($(this).hasClass("st-occ-toggle-button-time")) {
      $(".st-occ-toggle-cont-time")
        .addClass("st-occ-toggle-cont-active")
        .stop();
      $(".st-occ-toggle-cont-amount")
        .removeClass("st-occ-toggle-cont-active")
        .stop();
    }

    if ($(this).hasClass("st-occ-toggle-button-amount")) {
      $(".st-occ-toggle-cont-amount")
        .addClass("st-occ-toggle-cont-active")
        .removeClass("st-occ-toggle-cont-inactive")
        .stop();
      $(".st-occ-toggle-cont-time")
        .removeClass("st-occ-toggle-cont-active")
        .addClass("st-occ-toggle-cont-inactive")
        .stop();
    }

    $(
      "header, .st-optionchart, .sidebar-mcont, .st-sidebar-nav-mcont, footer"
    ).click(function(e) {
      $('[class*="st-occ-toggle-mcont"] > .uk-icon-close').click();
    });
  }
  //$('[class*="st-occ-toggle-mcont"] > .uk-icon-close').click();
  sec.on(
    "click",
    '[class*="st-occ-toggle-mcont"] > .uk-icon-close',
    closeoffcanvas
  );

  function closeoffcanvas(e) {
    $(".st-occ-toggle-mcont")
      .removeClass("st-occ-toggle-mcont-active")
      .addClass("st-occ-toggle-mcont-inactive")
      .stop();
  }
  sec.on(
    "click",
    '[class*="st-occ-toggle-cont-time"] > div > div > div > ul > li',
    selectonlist
  );

  function selectonlist(e) {
    $("ul.st-list > li").removeClass("uk-active");
    $(this).addClass("uk-active");
    $(".st-occ-toggle-mcont")
      .removeClass("st-occ-toggle-mcont-active")
      .addClass("st-occ-toggle-mcont-inactive")
      .stop();
  }
  sec.on(
    "click",
    '[class*="st-occ-toggle-cont-amount"] > div > div > ul > li',
    function() {
      $(".st-occ-toggle-mcont")
        .removeClass("st-occ-toggle-mcont-active")
        .addClass("st-occ-toggle-mcont-inactive")
        .stop();
    }
  );

  // SIDEBAR NAVIGATION
  // $(".st-sidebar-nav-switcher").on("click", "li a", function(e) {
  //   $(".st-sidebar-nav-mcont").addClass("fadeInLeft uk-active");
  //   $(".st-sidebar-nav-mcont").removeClass("fadeOutLeft");
  //   $(".st-sidebar-nav-mcont").removeClass("uk-hidden");
  //   $(".st-sidebar-nav-mcont-2").removeClass("uk-single");

  //   if ($(".st-sidebar-nav-mcont").hasClass("uk-active")) {
  //     $(".st-optionchart-mcont").css({
  //       left: "270px"
  //     });
  //   }

  //   if ($(".st-sidebar-nav-mcont-2").hasClass("uk-active")) {
  //     $(".st-optionchart-mcont").css({
  //       left: "540px"
  //     });
  //   }
  // });

function handler1() {
  $(".st-sidebar-nav-mcont").addClass("fadeInLeft uk-active");
  $(".st-sidebar-nav-mcont").removeClass("uk-hidden");
  $(".id1_panel").addClass("uk-flex container ");
  $(".id1_panel").removeClass("uk-hidden ");
  $(".st-sidebar-nav-mcont-2").removeClass("uk-single");

  if($('.id2_panel').hasClass('uk-hidden')){
    $(".panelDiv").addClass("container2");
  } else {
    $(".panelDiv").removeClass("container2");
    
  }
  if ($(".st-sidebar-nav-mcont").hasClass("uk-active")) {
    $(".st-optionchart-mcont").css({
      left: "270px"
    });
  }
  if ($(".st-sidebar-nav-mcont-2").hasClass("uk-active")) {
    $(".st-sidebar-nav-mcont-2").css({
      left: "270px"
    });
    $(".st-optionchart-mcont").css({
      left: "540px"
    });
  }
$('#id1 a').css("background-color"," #31353c")
  $(this).one("click", handler2);
  setTimeout(bgr, 500 );
  
}

function handler2() {
  if($('.id2_panel').hasClass('uk-hidden')){
    $(".st-sidebar-nav-mcont").removeClass("fadeInLeft uk-active");
    $(".st-sidebar-nav-mcont").addClass("uk-hidden");
    $('.id1_panel').removeClass('uk-flex container')
    $(".id1_panel").addClass("uk-hidden ");
    $(".panelDiv").addClass("container2");
    if ($('[class*="st-sidebar-nav-mcont"]').hasClass("uk-active")) {
      $(".st-optionchart-mcont").css({
        left: "270px"
      });
    } else {
      $(".st-optionchart-mcont").css({
        left: "0"
      });
     
    }
    $(".st-sidebar-nav-mcont-2").css({
      left: "0"
    });
  } else {
    $('.id1_panel').removeClass('uk-flex container')
    $(".id1_panel").addClass("uk-hidden ");
    $(".panelDiv").addClass("container2");
    
  }

  $('#id1 a').css("background-color"," black")
  $(this).one("click", handler1);
  setTimeout(bgr, 500 );
}

$("#id1").one("click", handler1) ;


//   $("#id1").on("click", function(e) {
//     $(".st-sidebar-nav-mcont").addClass("fadeInLeft uk-active");
//     $(".st-sidebar-nav-mcont").removeClass("uk-hidden");
//     $(".id1_panel").addClass("uk-flex container ");
//     $(".id1_panel").removeClass("uk-hidden ");
//     $(".st-sidebar-nav-mcont-2").removeClass("uk-single");

//     if($('.id2_panel').hasClass('uk-hidden')){
//       $(".panelDiv").addClass("container2");
//     } else {
//       $(".panelDiv").removeClass("container2");
      
//     }
//     if ($(".st-sidebar-nav-mcont").hasClass("uk-active")) {
//       $(".st-optionchart-mcont").css({
//         left: "270px"
//       });
      
//     }
//     if ($(".st-sidebar-nav-mcont-2").hasClass("uk-active")) {
//       $(".st-sidebar-nav-mcont-2").css({
//         left: "270px"
//       });
//       $(".st-optionchart-mcont").css({
//         left: "540px"
//       });
//     }
//   }
// );

  // $("#id2").on("click", function(e) {
  //   $(".st-sidebar-nav-mcont").addClass("fadeInLeft uk-active");
  //   $(".st-sidebar-nav-mcont").removeClass("uk-hidden");
  //   $(".id2_panel").addClass("uk-flex container");
  //   $(".id2_panel").removeClass("uk-hidden ");
  //   $(".st-sidebar-nav-mcont-2").removeClass("uk-single");

  //   if($('.id1_panel').hasClass('uk-hidden')){
  //     $(".panelDiv").addClass("container2");
  //   } else {
  //     $(".panelDiv").removeClass("container2");
      
  //   }
  //   if ($(".st-sidebar-nav-mcont").hasClass("uk-active")) {
  //     $(".st-optionchart-mcont").css({
  //       left: "270px"
  //     });
     
  //   }
  //   if ($(".st-sidebar-nav-mcont-2").hasClass("uk-active")) {
  //     $(".st-sidebar-nav-mcont-2").css({
  //       left: "270px"
  //     });
  //     $(".st-optionchart-mcont").css({
  //       left: "540px"
  //     });
  //   }
  // });

  function handler3() {
    $(".st-sidebar-nav-mcont").addClass("fadeInLeft uk-active");
      $(".st-sidebar-nav-mcont").removeClass("uk-hidden");
      $(".id2_panel").addClass("uk-flex container");
      $(".id2_panel").removeClass("uk-hidden ");
      $(".st-sidebar-nav-mcont-2").removeClass("uk-single");
  
      if($('.id1_panel').hasClass('uk-hidden')){
        $(".panelDiv").addClass("container2");
      } else {
        $(".panelDiv").removeClass("container2");
        
      }
      if ($(".st-sidebar-nav-mcont").hasClass("uk-active")) {
        $(".st-optionchart-mcont").css({
          left: "270px"
        });
      }
      if ($(".st-sidebar-nav-mcont-2").hasClass("uk-active")) {
        $(".st-sidebar-nav-mcont-2").css({
          left: "270px"
        });
        $(".st-optionchart-mcont").css({
          left: "540px"
        });
      }
      $('#id2 a').css("background-color"," #31353c")
    $(this).one("click", handler4);
    setTimeout(bgr, 500 );
  }

  function handler4() {
    if($('.id1_panel').hasClass('uk-hidden')){
      $(".st-sidebar-nav-mcont").removeClass("fadeInLeft uk-active");
      $(".st-sidebar-nav-mcont").addClass("uk-hidden");
      $('.id2_panel').removeClass('uk-flex container')
      $(".id2_panel").addClass("uk-hidden ");
      $(".panelDiv").addClass("container2");
      if ($('[class*="st-sidebar-nav-mcont"]').hasClass("uk-active")) {
        $(".st-optionchart-mcont ").css({
          left: "270px"
        });
      } else {
        $(".st-optionchart-mcont").css({
          left: "0"
        });
      }
      $(".st-sidebar-nav-mcont-2").css({
        left: "0"
      });
    } else {
      $('.id2_panel').removeClass('uk-flex container')
      $(".id2_panel").addClass("uk-hidden ");
      $(".panelDiv").addClass("container2");
      
    }
    $('#id2 a').css("background-color"," black")
    $(this).one("click", handler3);
    setTimeout(bgr, 500 );
  }

  $("#id2").one("click", handler3);

  $(".id1_panel").on("click", ".uk-icon-close" , function(e) {
    if($('.id2_panel').hasClass('uk-hidden')){
      $(".st-sidebar-nav-mcont").removeClass("fadeInLeft uk-active");
      $(".st-sidebar-nav-mcont").addClass("uk-hidden");
      $('.id1_panel').removeClass('uk-flex container')
      $(".id1_panel").addClass("uk-hidden ");
      $(".panelDiv").addClass("container2");
      if ($('[class*="st-sidebar-nav-mcont"]').hasClass("uk-active")) {
        $(".st-optionchart-mcont").css({
          left: "270px"
        });
      } else {
        $(".st-optionchart-mcont").css({
          left: "0"
        });
      }
      $(".st-sidebar-nav-mcont-2").css({
        left: "0"
      });
    } else {
      $('.id1_panel').removeClass('uk-flex container')
      $(".id1_panel").addClass("uk-hidden ");
      $(".panelDiv").addClass("container2");
      
    }
    $('#id1 a').css("background-color"," black")
    $("#id1").one("click", handler1);
    setTimeout(bgr, 500 );
  })

  $(".id2_panel").on("click", ".uk-icon-close" , function(e) {
    if($('.id1_panel').hasClass('uk-hidden')){
      $(".st-sidebar-nav-mcont").removeClass("fadeInLeft uk-active");
      $(".st-sidebar-nav-mcont").addClass("uk-hidden");
      $('.id2_panel').removeClass('uk-flex container')
      $(".id2_panel").addClass("uk-hidden ");
      $(".panelDiv").addClass("container2");
      if ($('[class*="st-sidebar-nav-mcont"]').hasClass("uk-active")) {
        $(".st-optionchart-mcont ").css({
          left: "270px"
        });
      } else {
        $(".st-optionchart-mcont").css({
          left: "0"
        });
      }
      $(".st-sidebar-nav-mcont-2").css({
        left: "0"
      });
    } else {
      $('.id2_panel').removeClass('uk-flex container')
      $(".id2_panel").addClass("uk-hidden ");
      $(".panelDiv").addClass("container2");
      
    }
    $('#id2 a').css("background-color"," black")
    $("#id2").one("click", handler3);
    setTimeout(bgr, 500 );
  })

$(".st-sidebar-nav-mcont-2").on('click', '.uk-icon-close', function(e) {
  $(".st-sidebar-nav-mcont-2").removeClass("fadeInLeft uk-active");
  $(".st-sidebar-nav-mcont-2").addClass("fadeOutLeft");
  $(".st-sidebar-nav-mcont-2").addClass("uk-hidden");
  $(".st-sidebar-nav-mcont-2").addClass("uk-single");
  if ($('[class*="st-sidebar-nav-mcont"]').hasClass("uk-active")) {
        $(".st-optionchart-mcont").css({
          left: "270px"
        });
      } else {
        $(".st-optionchart-mcont").css({
          left: "0"
        });
      }
      setTimeout(bgr, 500 );
})


  //$('.st-tradinghistory-details'), .st-tradinghistory-details > li
  sec.on("click",".st-tradinghistory-details, .st-tradinghistory-details > li", function(e) {
      $(".st-sidebar-nav-mcont-2").addClass("fadeInLeft uk-active");
      $(".st-sidebar-nav-mcont-2").removeClass("fadeOutLeft");
      $(".st-sidebar-nav-mcont-2").removeClass("uk-hidden");
      $(".st-sidebar-nav-mcont-2").removeClass("uk-single");

      if ($(".st-sidebar-nav-mcont-2").hasClass("uk-active")) {
        $(".st-sidebar-nav-mcont-2").css({
          left: "270px"
        });
        $(".st-optionchart-mcont").css({
          left: "540px"
        });
      }
      setTimeout(bgr, 500 );
    }
  );

  
  // $('[class*="st-sidebar-nav-mcont"]').on("click", ".uk-icon-close", function(e) {
  //   $(this).parent().removeClass("fadeInLeft uk-active");
  //   $(this).parent().addClass("fadeOutLeft");
  //   $(".st-sidebar-nav-mcont-2").addClass("uk-single");

  //   if ($('[class*="st-sidebar-nav-mcont"]').hasClass("uk-active")) {
  //     $(".st-optionchart-mcont").css({
  //       left: "270px"
  //     });
  //   } else {
  //     $(".st-optionchart-mcont").css({
  //       left: "0"
  //     });
  //   }
  // });



  // PREVENTING OFFCANVAS TO HIDE WHEN SWIPED IN ITS CONTAINER
  $(".uk-offcanvas").on("swipe", function() {
    show.uk.offcanvas;
  });
  $(".uk-close").click(function(e) {
    $(".uk-offcanvas").click();
  });

  // REMOVE ASSET BUTTON
  $(".st-asset-button > .uk-icon-close").click(function(e) {
    $(this)
      .parents("li")
      .remove();
  });

  // BUTTON RIPPLE
  $(
    '[class*="uk-button"], [class*="st-asset-button"], .st-occ-panel-button > *'
  ).prepend(
    '<div class="c-ripple js-ripple"><div class="c-ripple__circle"></div></div>'
  );
  $(".c-ripple.js-ripple")
    .parent()
    .css("position", "relative");

  (function($, window, document, undefined) {
    "use strict";

    var $ripple = $(".js-ripple");

    $ripple.on("click.ui.ripple", function(e) {
      var $this = $(this);
      var $offset = $this.parent().offset();
      var $circle = $this.find(".c-ripple__circle");

      var x = e.pageX - $offset.left;
      var y = e.pageY - $offset.top;

      $circle.css({
        top: y + "px",
        left: x + "px"
      });

      $this.addClass("is-active");
    });

    $ripple.on(
      "animationend webkitAnimationEnd oanimationend MSAnimationEnd",
      function(e) {
        $(this).removeClass("is-active");
      }
    );
  })(jQuery, window, document);
});
