

function setupTabs(){
        document.querySelectorAll(".tabs-button").forEach(button => {
          button.addEventListener("click", () => {
            const sideBar = button.parentElement;
            const tabsContainer = sideBar.parentElement;
            const tabNumber = button.dataset.forTab;
            const tabToActivate = tabsContainer.querySelector(`.tabs-content[data-tab="${tabNumber}"]`);
            sideBar.querySelectorAll(".tabs-button").forEach(button => {
              button.classList.remove("tab-button-active");
            });

            tabsContainer.querySelectorAll(".tabs-content").forEach(tab => {
              tab.classList.remove("tabs-content-active");
            });
          
            button.classList.add("tab-button-active");
            tabToActivate.classList.add("tabs-content-active");
          
          })
        })
      }

      document.addEventListener("DOMContentLoaded", () => {
        setupTabs();
        document.querySelectorAll(".tabs").forEach(tabsContainer => {
          tabsContainer.querySelector(".tabs-sidebar .tabs-button").click();
        })
      })

