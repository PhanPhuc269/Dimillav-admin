document.addEventListener('DOMContentLoaded', function () {
    let currentPath = window.location.pathname;


document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const page = path.split("/")[1];
    const subpage = path.split("/")[2];

    const menuItems = {
        '': 'dashboard',
        'account': 'account',
        'product': 'products',
        'report': 'report',
        'inventory': 'inventory',
        'order': 'orders',

    };

    const subMenuItems = {
        'product': {
            'list': 'list-products',
            'add': 'add-product',
            'edit': 'edit-product',
        },
        'order': {
            'list': 'orders',
            'detail': 'order-detail',
        },
        'report': {
            'sales': 'sales-report',
            'revenue': 'revenue-report',
        },
    };

    if (menuItems[page]) {
        document.getElementById(menuItems[page]).classList.add('active');
        document.getElementById(menuItems[page]).classList.add('show-special');
        
        if (subMenuItems[page] && subMenuItems[page][subpage]) {
            document.getElementById(subMenuItems[page][subpage]).classList.add('active-sub');
        }
    }
});
// =======
//     console.log('Current Path:', currentPath);
    

//     // Map URL path to menu IDs and their parent IDs (if applicable)
//     const menuMap = {
//         '/': { id: 'menu-dashboard' },
//         '/account': { id: 'menu-account' },
//         '/orders': { id: 'menu-orders' },
//         '/inventory': { id: 'menu-inventory' },
//         '/product/list': { id: 'menu-product-list', parentId: 'menu-products' },
//         '/product/create': { id: 'menu-product-create', parentId: 'menu-products' },
//         '/report/revenue': { id: 'menu-report-revenue', parentId: 'menu-reports' },
//         '/report/sales': { id: 'menu-report-sales', parentId: 'menu-reports' },
//         '/report/topProducts': { id: 'menu-report-topProducts', parentId: 'menu-reports' },
//     };

//      // Highlight active menu
//      const activeMenu = menuMap[currentPath];
//      console.log('activeMenu:', activeMenu);

//      if (activeMenu) {
//          const activeElement = document.getElementById(activeMenu.id);
//          if (activeElement) {
//              activeElement.classList.add('active');
//          }
 
//          // Highlight parent menu if applicable and keep dropdown open
//          if (activeMenu.parentId) {
//              const parentElement = document.getElementById(activeMenu.parentId);
//              if (parentElement) {
//                  parentElement.classList.add('active'); // Highlight parent
//                  parentElement.classList.add('show'); // Keep dropdown open
 
//                  // Keep dropdown menu visible
//                  const dropdownMenu = parentElement.nextElementSibling;
//                  if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
//                      dropdownMenu.classList.add('show');
//                  }
//              }
//          }
//      } else {
//          console.warn('No matching menu item for path:', currentPath);
//      }
//  });



(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });

    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });

    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, { offset: '80%' });

    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });

    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        nav: false
    });

    // Chart Global Color
    Chart.defaults.color = "#6C7293";
    Chart.defaults.borderColor = "#000000";

    // Example chart code here...

})(jQuery);
