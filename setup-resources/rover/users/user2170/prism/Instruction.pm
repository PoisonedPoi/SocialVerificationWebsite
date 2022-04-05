mdp

global summarize: bool;
global r_speaking: bool;
global h_speaking: bool;
global r_waiting: bool;

init
	summarize=false &
	r_speaking=false &
	h_speaking=false &
	r_waiting=false &
	st_m=4 &
	st_n=1 &
	st_o=3 &
	st_p=1
endinit
module Robot

	st_m: [0..4];
	[r_speak] st_m=4 & summarize=false -> (st_m'=2) & (r_speaking'= true);
	[] st_m=1 & h_speaking=false -> (st_m'=0) & (r_waiting'=false);
	[doneInstructing] st_m=2 & r_speaking= false -> (st_m'=1) & (r_waiting'=true);
	[r_speak] st_m=3 -> (st_m'=2) & (r_speaking'= true);
	[] st_m=4 & summarize=true -> (st_m'=3);

endmodule

module R_Speech

	st_n: [0..1];
	[] st_n=0 -> (st_n'=1) & (r_speaking'= false);
	[r_speak] st_n=1 -> (st_n'=0);

endmodule

module Human

	st_o: [0..3];
	[doneInstructing] st_o=3 -> (st_o'=2);
	[] st_o=2 & r_waiting=true -> (st_o'=1);
	[h_speak] st_o=2 & r_waiting=true -> (st_o'=0) & (h_speaking'= true);

endmodule

module H_Speech

	st_p: [0..1];
	[] st_p=0 -> (st_p'=1) & (h_speaking'= false);
	[h_speak] st_p=1 -> (st_p'=0);

endmodule

