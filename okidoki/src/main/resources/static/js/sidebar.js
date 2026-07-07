   // JavaScript for dropdown functionality
   document.addEventListener('DOMContentLoaded', function () {
    //    submenu thiyena items tika gnnw
    const menuItems = document.querySelectorAll('.has-submenu');

    // menu items click karaddi eata adala menu item eka gnnw
    menuItems.forEach(item => {
      item.addEventListener('click', function ()  {
        // menu item eke thiyena data-target attribute eka gnnw
        const targetId = this.getAttribute('data-target');
        // e data-target attribute eka use karala submenu eka gnnw
        const submenu = document.getElementById(targetId);

        // // Toggle the open class for the clicked item
        this.classList.toggle('open');

        // Toggle the submenu
        submenu.classList.toggle('open');
      });
    });
       // load the module list for the user dom load ekedi call karanwa
       loadModuleWithoutUser();
       // naviate to the current page on dom load karaddi
       breadCrumbItemInTopBar();

        // dom load weddi loge userta adala module list eka search eke fill karanwa
        moduleListForUser = getServiceRequest("/moduleforuser");
       dataFillIntoDataList(selectModuleList, moduleListForUser, "name");
  });

 // --------------------------------------------------------------------------------------------------------------
 // when select the module from the list ,auto navigate to the module page
   const selectModule = document.getElementById('typeModule');
    selectModule.addEventListener('focusout', function () {
         // Get the module list for the user
         const selectedModule = this.value;
        console.log("Selected module:", selectedModule);
            // Check if the selected module is in the list

            const isModuleInList = moduleListForUser.find(module => module.name === selectedModule);
            // select karana  module eka list eke thiyenawa nam navigate karanwa adala page ekata
         if (isModuleInList) {
              // selectmodule eke id eke lowwercase walata convert karala link eke yawanawa
              // select karana module eke space thiyenw nam ewath ayin karanawa
              window.location.href = `/${selectedModule.toLowerCase().replace(/\s+/g, '')}`;

         } else{
             // select karana module eka naththan console log karanawa
             console.log("Please select a module from the list.");
         }
    });


   // -------------------------------------------------------topbar js---------------------------------

   // profile button dropdown eke id eka gnnwa
   const profileBtn = document.querySelector('.profile-btn');
    // profile button click karaddi dropdown eka open karanawa
   const profileDropdown = document.querySelector('.profile-dropdown');
   profileBtn.addEventListener('click', (e) => {

       e.stopPropagation();
         // Toggle the dropdown visibility
       profileDropdown.classList.toggle('active');
   });
   // Close dropdown when clicking outside
   document.addEventListener('click', (e) => {
       if (!profileDropdown.contains(e.target)) {
           profileDropdown.classList.remove('active');
       }
   });


 //   -------------------------------------------------------element hide karanwa user anuwa---------------------------------

   const loadModuleWithoutUser = () => {
        moduleList = getServiceRequest("/modulewithoutuser")
       for (const module  of moduleList) {
           $(`#${module.name}`).css("display", "none");
           $(`.${module.name}`).css("display", "none");

       }
   }

   // ------------------------------------------------------dynamically breadcrumb item in top bar-----------------------------
    const breadCrumbItemInTopBar = () => {
         // cuurunt location path eka gnnw  / meken split karala first segment eka gnnw
         const currentPath ='/' + window.location.pathname.split('/')[1]; // Get the first segment of the path

        //class path enter as breadcum
        if (currentPath === '/dashboard') {
            document.querySelector('#dashobordPath').innerHTML = `<a style="text-decoration: none; color: #dc4b4b" href="${currentPath}">Dashboard</a>`;
        }else{
            curruntPath.style.display = 'block';
            document.querySelector('#dashobordPath').innerHTML = `<a class="opacity-5 text-dark" style="text-decoration: none;" href="/dashboard">Dashboard</a>`;
            document.querySelector('#curruntPath').innerHTML = `<a style="text-decoration: none; color: #dc4b4b" href="${currentPath}">${currentPath.split('/')[1].charAt(0).toUpperCase() + currentPath.split('/')[1].slice(1)}</a>`;
        }

    };

   // -----------------------------------------------------active side bar item highlight----------------------------------------

   const colorActiveSideBarMenuItem = () => {

       // current path eke loaction eka gnnw
       const currentPath = window.location.pathname;
       // Select all menu items
       const menuItems = document.querySelectorAll('.menu-item');
       // Select all submenu items
       const subMenuItems = document.querySelectorAll('.submenu-item');

       // Highlight main menu items
       menuItems.forEach(menuItem => {
           // item path eka gnnw menu item wala thiyen a tag eke href attribute eken
           const itemPath = menuItem.querySelector('.menu-item a')?.getAttribute('href');
           // itempath eka curruntpath ekata samana nam
           if (itemPath && itemPath === currentPath) {
               // Add karanwa active and open classes
               menuItem.classList.add('active', 'open');
           } else {
                //samana naththan  Remove karanwa active and open classes
               menuItem.classList.remove('active', 'open');
           }
       });

       // Highlight submenu items
       subMenuItems.forEach(submenuItem => {
           // subemenu wala a tag eke href attribute eken item path eka gnnw
           const itemPath = submenuItem.getAttribute('href');
           // item path eka currunt path ekata samanada kiyala balanawa
           if (itemPath === currentPath) {
               // samana nam active class eka add karala css add karanwa
               submenuItem.classList.add('active');

               // submenu eke active class eka thiyenawanam eka open karala thiyanna oni
               // eka nisa submenu item ekata adala menu itema eka gnnwa
               // closest method eka use karala submenu item ekata adala parent menu eka gnnw
               const parentMenu = submenuItem.closest('.submenu');
               // parent menu ekata kalin class eka gnnwa
               const parentMenuItem = parentMenu ? parentMenu.previousElementSibling : null;
               console.log("Parent Menu:", parentMenuItem);
               // parent menu ekak thiyenw nam if eka true karanwa
               if (parentMenu) {
                     // parent menu ekata open class eka saha active class eka add karanawa
                   parentMenu.classList.add('open');
                   parentMenuItem.classList.add('active','open');

               }
           } else {
               submenuItem.classList.remove('active');
           }
       });
   }


// //craete function for toggle button topbar sidebar
//     const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
//     const sidebar = document.getElementsByClassName('navigation');
//    const menuItems = document.getElementsByClassName('menu-item');
//     const content = document.getElementById('content');
//
//    sidebarToggleBtn.addEventListener('click', () => {
//        Array.from(sidebar).forEach(el => el.classList.toggle('active'));
//        Array.from(menuItems).forEach(el => el.classList.toggle('active'));
//    });
//
//     // Call the function to color the active menu item when the page loads
//     document.addEventListener('DOMContentLoaded', colorActiveSideBarMenuItem);
   // On toggle button click
   document.getElementById('themeToggleBtn').addEventListener('click', function () {
       document.body.classList.toggle('dark-theme');
       // Save preference
       if (document.body.classList.contains('dark-theme')) {
           localStorage.setItem('theme', 'dark');
       } else {
           localStorage.setItem('theme', 'light');
       }
   });

   // On page load
   window.addEventListener('DOMContentLoaded', function () {
       if (localStorage.getItem('theme') === 'dark') {
           document.body.classList.add('dark-theme');
       }
   });