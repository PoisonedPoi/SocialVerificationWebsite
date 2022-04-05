mdp

global start: bool init true;
global end: bool init false;
global hstate: [0..3] init 0;
global hstate_overall: [0..2] init 2;

module mod

	s: [0..3] init 0;


	// init
	[] s=0 & start=true & hstate=0 -> (s'=0) & (start'=false) & (hstate'=3);
	[] s=0 & start=true & hstate=2 -> (s'=0) & (start'=false) & (hstate'=3);
	[] s=0 & start=false & end=false -> (s'=0) & (end'=true) & (hstate'=0) & (hstate_overall'=0);
	[] s=0 & start=false & end=false -> (s'=0) & (end'=true) & (hstate'=2) & (hstate_overall'=2);
	// init outgoing transitions
	[] s=0 & start=false & end=true & hstate=0 -> (s'=1) & (start'=true) & (end'=false);
	[] s=0 & start=false & end=true & hstate=1 -> (s'=1) & (start'=true) & (end'=false);
	[] s=0 & start=false & end=true & hstate=2 -> (s'=1) & (start'=true) & (end'=false);
	// untitled0
	[] s=1 & start=true & hstate=0 -> (s'=1) & (start'=false) & (hstate'=3);
	[] s=1 & start=false & end=false -> (s'=1) & (end'=true) & (hstate'=0) & (hstate_overall'=0);
	[] s=1 & start=false & end=false -> (s'=1) & (end'=true) & (hstate'=2) & (hstate_overall'=2);
	// untitled0 outgoing transitions
	[] s=1 & start=false & end=true & hstate=0 -> (s'=2) & (start'=true) & (end'=false);
	[] s=1 & start=false & end=true & hstate=1 -> (s'=2) & (start'=true) & (end'=false);
	[] s=1 & start=false & end=true & hstate=2 -> (s'=2) & (start'=true) & (end'=false);
	// untitled1
	[] s=2 & start=true & hstate=0 -> (s'=2) & (start'=false) & (hstate'=3);
	[] s=2 & start=true & hstate=1 -> (s'=2) & (start'=false) & (hstate'=3);
	[] s=2 & start=true & hstate=2 -> (s'=2) & (start'=false) & (hstate'=3);
	[] s=2 & start=false & end=false -> (s'=2) & (end'=true) & (hstate'=0) & (hstate_overall'=0);
	[] s=2 & start=false & end=false -> (s'=2) & (end'=true) & (hstate'=2) & (hstate_overall'=2);
	// untitled1 outgoing transitions
	[] s=2 & start=false & end=true & hstate=0 -> (s'=3) & (start'=true) & (end'=false);
	[] s=2 & start=false & end=true & hstate=1 -> (s'=3) & (start'=true) & (end'=false);
	[] s=2 & start=false & end=true & hstate=2 -> (s'=3) & (start'=true) & (end'=false);
	// untitled2
	[] s=3 & start=true & hstate=0 -> (s'=3) & (start'=false) & (hstate'=3);
	[] s=3 & start=true & hstate=2 -> (s'=3) & (start'=false) & (hstate'=3);
	[] s=3 & start=false & end=false -> (s'=3) & (end'=true) & (hstate'=0) & (hstate_overall'=0);
	[] s=3 & start=false & end=false -> (s'=3) & (end'=true) & (hstate'=2) & (hstate_overall'=2);
	// untitled2 outgoing transitions

endmodule
label "Farewell" = s=3;
label "Greeter" = s=0;
label "Ask" = s=1;
label "Remark" = s=2;
label "Answer" = false;
label "Handoff" = false;
label "Wait" = false;
label "Instruction" = false;
label "speaks" = s=3 | s=0 | s=2 | s=1;
label "hspeaks" = s=3 | s=0 | s=1;
label "speaksFirst" = s=3 | s=0 | s=2 | s=1;
label "hspeaksFirst" = false;
label "ready" = hstate=0;
label "busy" = hstate=1;
label "ignore" = hstate=2;
label "ready_overall" = hstate_overall=0;
label "busy_overall" = hstate_overall=1;
label "ignore_overall" = hstate_overall=2;
