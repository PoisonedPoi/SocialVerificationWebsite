mdp

global asked: bool;
global startedAsking: bool;
global understood: bool;
global ended: bool;
global Introduction: bool;
global ready_for_question: bool;

init
	asked=false &
	startedAsking=false &
	understood=true &
	ended=false &
	Introduction=false &
	ready_for_question=false &
	st_m=0 &
	(st_n=0 | st_n=2 | st_n=3) &
	st_o=1 &
	st_p=1
endinit
module Robot

	st_m: [0..6];
	[speak] st_m=1 & asked=true & understood=true -> (st_m'=2);
	[speak] st_m=0 & Introduction=true -> (st_m'=6);
	[doneSpeak] st_m=6 -> (st_m'=1) & (ready_for_question'=true);
	[] st_m=0 & Introduction=false -> (st_m'=1) & (ready_for_question'=true);
	[speak] st_m=1 & asked=true & understood=false -> (st_m'=3);
	[speak] st_m=1 & asked=true & understood=false -> (st_m'=3);
	[speak] st_m=1 & asked=true & understood=false -> (st_m'=4);
	[giveup] st_m=4 -> (st_m'=5);
	[] st_m=1 & asked=false & startedAsking=false & understood=true -> (st_m'=5) & (ended'=true);
	[doneSpeak] st_m=3 -> (st_m'=1);
	[doneSpeak] st_m=2 -> (st_m'=5) & (ended'=true);

endmodule

module Human

	st_n: [0..3];
	[doneSpeak] st_n=0 -> (st_n'=0) & (startedAsking'=false) & (asked'=false);
	[doneSpeak] st_n=2 -> (st_n'=2) & (startedAsking'=false) & (asked'=false);
	[doneSpeak] st_n=3 -> (st_n'=3) & (startedAsking'=false) & (asked'=false);
	[h_speak] st_n=2 & ended=false & asked=false -> (st_n'=1) & (startedAsking'=true);
	[h_speak] st_n=3 & ended=false & asked=false -> (st_n'=1) & (startedAsking'=true);
	[h_speak] st_n=0 & asked=false & ended=false -> (st_n'=1) & (startedAsking'=true);
	[h_donespeak] st_n=1 -> (st_n'=0) & (understood'=true) & (asked'=true);
	[h_donespeak] st_n=1 -> (st_n'=0) & (asked'=true) & (understood'=false);
	[giveup] st_n=0 -> (st_n'=2);

endmodule

module R_Speech

	st_o: [0..1];
	[speak] st_o=1 -> (st_o'=0);
	[doneSpeak] st_o=0 -> (st_o'=1);
	[giveup] st_o=0 -> (st_o'=1);

endmodule

module H_Speech

	st_p: [0..1];
	[h_speak] st_p=1 & ready_for_question=true -> (st_p'=0);
	[h_donespeak] st_p=0 -> (st_p'=1);

endmodule

