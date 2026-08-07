import { move_on_to_next_experiment_state } from "./move_on_to_next_experiment_state.js";
import { record_general_participant_info } from "./record_general_participant_info.js";
import { points2pounds } from "./functions/usefulFunctions.js";

function check_performance_after_practice(exp) {
  /*
  Function that:
  - Checks if participant has pcorrect >= 75% after practice session
  - If pcorrect < 75%, participant is excluded and experiment ends
  - If pcorrect >= 75%, participant continues to real Learning Task sessions

  Threshold derivation (binomial test against chance, p = 0.5):
  20 practice trials total (2 pairs x 10 trials/pair), each trial is a
  Bernoulli(0.5) event under the null hypothesis of guessing at chance.
  For n = 20, p = 0.5: P(X >= 14) = 5.77% (not significant),
  P(X >= 15) = 2.07% (significant at alpha = 0.05, one-tailed).
  So >= 15/20 correct (75%) is required to conclude performance is
  above chance.
  */

  console.log('--- check_performance_after_practice() ---');
  console.log(`Performance: ${(exp.pcorrect_LearningTask * 100).toFixed(1)}%`);

  // ========== CRITICAL: CLEAR EVERYTHING FIRST ==========
  // Clear all possible containers
  $('#Stage').remove();
  $('#Vals').remove();
  $('#respButtons').remove();
  $('#FinalButton').remove();
  $('#Top').empty();
  $('#ContBox').empty();
  $('#Bottom').empty();
  $('#Cont2_row').empty();
  
  // Reset HTML structure
  document.getElementById("Cont").style.maxWidth = null;
  document.getElementById("Cont").style.maxHeight = null;
  document.getElementById("ContBox").style.maxWidth = null;
  document.getElementById("ContBox").style.maxHeight = null;
  document.getElementById("ContBox").className = "col-12 mt-3 visible";

  // Create shortcut for text object
  let text = exp.text_mid_task_exclusion;
  
  // Initialize variables
  let main_text = "";
  let link = "";

  // ------ Display different messages based on value of pcorrect ------
  if (exp.pcorrect_LearningTask < 0.75) {
    // EXCLUSION: Participant must terminate the experiment
    console.log(' Performance below threshold - EXCLUSION');
    
    // Set up "exclusion" completion link
    link = exp.link_exclusion || exp.generic_prolific_link || "#";

    // Set up message that they are excluded from the experiment
    let total_reward = exp.total_reward.toFixed(2);
    main_text = `
      <div class="col">
        <div class="col">
          <p align="center"><br>${text.exclusion_1}${total_reward}${text.exclusion_2}</p>
          <p align="center"><br>${text.exclusion_3}<br></p>
          <p align="center"><br>${text.exclusion_4}</p>
        </div>
      </div>
    `;

    // Record info about participant bonus, navigator, and task durations
    exp.bonus_UK_pounds = points2pounds(exp.total_reward, exp.rate);
    
    // Only call record function if NOT in test mode
    if (!exp.test_mode_do_NOT_send_data) {
      record_general_participant_info(exp);
    }

  } else { 
    // INCLUSION: Participant can continue the experiment
    console.log('Performance above threshold - INCLUSION');
    let practice_score = exp.total_reward.toFixed(2);
    
    main_text = `
      <div class="col">
        <div class="col">
          <p align="center"><br>${text.inclusion_1}</p>
          <p align="center"><br>${text.inclusion_2}</p>
          <p align="center"><br>Please follow the instructions carefully to complete the remaining tasks.</p>
          <p align="center"><br>You will now start the next part of the task with new symbols.</p>
        </div>
      </div>
      `;
  }

  // Create HTML containers (FRESH START)
  let container_Stage = "<div class='row justify-content-center' id='Stage'></div>";
  let container_Button = '<div class="col justify-content-center align-items-center" id="c_button"></div>';
  
  $("#ContBox").html(container_Stage + container_Button);
  
  // Add text
  $("#Stage").html(`<div class="row justify-content-center">${main_text}</div>`);
  
  // Add button
  if (exp.pcorrect_LearningTask < 0.75) {
    // EXCLUSION: Button to return to Prolific (or close window in test mode)
    let button_html = '';
    if (exp.test_mode_do_NOT_send_data === 1) {
      button_html = `<div class="row justify-content-center">
                       <div class="btn btn-default myBtn" style="background-color: #dc3545; cursor: default;">
                         Test Complete (Excluded) - Close Window
                       </div>
                     </div>`;
    } else {
      button_html = `<div class="row justify-content-center">
                       <a href="${link}" class="btn btn-default myBtn" style="background-color: #dc3545;">
                         ${text.button_Prolific}
                       </a>
                     </div>`;
    }
    $("#c_button").html(button_html);
    
  } else {
    // INCLUSION: Button to continue to main task
    let button_html = `<div class="row justify-content-center">
                         <input type="button" class="btn btn-default myBtn" id="move_on_button" 
                                value="Continue to Main Task" style="background-color: #28a745;">
                       </div>`;
    $("#c_button").html(button_html);
    
    document.getElementById("move_on_button").onclick = function () {
      console.log('Participant clicked continue - moving to main task');
      
      // Clear the performance check display
      $("#ContBox").empty();
      $("#Bottom").empty();

      // Advance the state machine to State 6, which calls the continuation
      // function stored by the Learning Task (window.LT_continue_after_check)
      move_on_to_next_experiment_state(1, exp);
    };
  }

  // Make container visible
  document.getElementById('Cont').style.visibility = "visible";
}

export { check_performance_after_practice };
