import { move_on_to_next_experiment_state } from "./move_on_to_next_experiment_state.js";
import { record_general_participant_info } from "./record_general_participant_info.js";
import { points2pounds } from "./functions/usefulFunctions.js";

function Mid_task_exclusion_check(exp) {
/*
function
- checks if participant has pcorrect > 59.8% (REMEMBER TO CONVERT p_chose_highest to pcorrect first)
- if pcorrect <= 59.8%, participant gets 
- if pcorrect > 59.8%, participant continues with the experiment, so move on to next task

*/

  // reset changes to HTML structure made during task
  document.getElementById("Cont").style.maxWidth = null; // unset change made to general HTML layout during task
  document.getElementById("Cont").style.maxHeight = null; // unset change made to general HTML layout during task
  document.getElementById("ContBox").style.maxWidth = null; // unset change made to general HTML layout during task
  document.getElementById("ContBox").style.maxHeight = null; // unset change made to general HTML layout during task
  document.getElementById("ContBox").className = "col-12 mt-3 visible";
  
  document.getElementById("Top").innerHTML = ""; 
  document.getElementById("ContBox").innerHTML = ""; 
  document.getElementById("Cont2_row").innerHTML = ""; 


  // create shortcut for text object
  let text = exp.text_mid_task_exclusion;
  // initialize variables
  let main_text = "";
  let link = "";

 
  // ------ display different messages based on value of pcorrect ------
  if (exp.pcorrect_LearningTask <= 0.598) { // participant must terminate the experiment
      // set up "exclusion" completion link
      link = exp.link_exclusion;

      // set up message that they are excluded from the experiment
      let total_reward = exp.total_reward.toString();
      main_text = `
        <div class="col">
          <div class="col">
            <p align="center"><br>${text.exclusion_1}${total_reward}${text.exclusion_2}</p>
            <p align="center"><br>${text.exclusion_3}<br></p>
            <p align="center"><br>${text.exclusion_4}</p>
          </div>
        </div>
      `;

      // record info about participant bonus, navigator, and task durations
      // first must update exp variable with final bonus in pounds
      exp.bonus_UK_pounds = points2pounds(exp.total_reward,exp.rate);
      record_general_participant_info(exp);

  } else { // participant can continue the experiment
      // set up "inclusion" completion link
      link = exp.link_inclusion;

      // set up message that they are not excluded from the experiment and can continue
      let total_reward = exp.total_reward.toString();
      let fixed_bonus = exp.fixed_bonus.toString();
      let max_earned_bonus = exp.max_earned_bonus.toString();
      let max_total_bonus = exp.max_total_bonus.toString();
      // fill in with text
      main_text = `
        <div class="col">
          <div class="col">
              <p align="center"><br>${text.inclusion_1}</p>
              <p align="center"><br>${text.inclusion_2}${total_reward}${text.inclusion_3}</p>
              <p align="center"><br>${text.inclusion_3a}${fixed_bonus}${text.inclusion_4}${max_earned_bonus}${text.inclusion_5}</p>
              <p align="center"><br>${text.inclusion_6}${max_total_bonus}${text.inclusion_7}</p>
              <p align="center"><br>${text.inclusion_8}<br></p>
            </div>
        </div>
      `;

  }

  // create HTML containers
  let container_Stage = "<div class = 'row justify-content-center' id = 'Stage'> </div>";
  let container_ProlificButton =  '<div class="col justify-content-center align-items-center" id="c_button_prolific"> </div>';
  let blank = '<p><br></p>';
  let container_MoveOnButton   =  '<div class="col justify-content-center align-items-center" id="c_move_on_button"> </div>';
  // add it to existing HTML containers
  //$("#ContBox").empty();

  $("#ContBox").html(container_Stage + container_ProlificButton + blank + container_MoveOnButton);
  // fill containers
  // add text
  $("#Stage").html( `<div class="row justify-content-center">${main_text}</div>`);
  // add content of button which should redirect to Prolific
  let button_prolific = `<div class="row justify-content-center"> <a href=${link} id="button_prolific" class="btn btn-default myBtn" target=”_blank”> ${text.button_Prolific} </a></div>`;
  $("#c_button_prolific").html(button_prolific);
  
  document.getElementById('Cont').style.visibility="visible" 

  if (exp.pcorrect_LearningTask > 0.598) {
      // when prolific button is clicked, make new button visible
      document.getElementById("button_prolific").onclick = function () {
          
          // create new button
          let button_move_on = `<div align="center"><input type="button" class="btn btn-default" id="move_on_button" value="${text.button_move_on}"></div>`;
          $("#c_move_on_button").html( `<div class="row justify-content-center">${button_move_on} </div>` );

          document.getElementById("move_on_button").onclick = function () {
              $("#ContBox").empty();
              // call experiment_state_machine to start the next task
              move_on_to_next_experiment_state(1,exp); // calls experiment_state_machine with increment of 1
          }
      }
  }

}
export { Mid_task_exclusion_check };