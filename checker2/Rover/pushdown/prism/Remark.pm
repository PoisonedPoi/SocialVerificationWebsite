mdp

global hlock: bool;
global doneSpeaking: bool;
global ended: bool;
global use_gesture: bool;
global Allow_human_to_respond: bool;

init
	hlock=false &
	doneSpeaking=false &
	ended=false &
	use_gesture=false &
	Allow_human_to_respond=false &
	st_m=0 &
	(st_n=0 | st_n=2) &
	st_o=1 &
	st_p=1
endinit
module Robot

	st_m: [0..3];
	[speak] st_m=0 -> (st_m'=1);
	[stopSpeaking] st_m=1 & Allow_human_to_respond=false & hlock=false -> (st_m'=2) & (doneSpeaking'=true);
	[stopSpeaking] st_m=1 & Allow_human_to_respond=true -> (st_m'=3) & (doneSpeaking'=true);
	[] st_m=3 & hlock=false -> (st_m'=2) & (ended'=true);

endmodule

module Human

	st_n: [0..4];
	[h_speak] st_n=0 & Allow_human_to_respond=true & doneSpeaking=true & ended=false -> (st_n'=4) & (hlock'=true);
	[h_speak] st_n=1 & Allow_human_to_respond=true & doneSpeaking=true & ended=false -> (st_n'=4) & (hlock'=true);
	[h_speak] st_n=2 & Allow_human_to_respond=true & doneSpeaking=true & ended=false -> (st_n'=4) & (hlock'=true);
	[h_donespeak] st_n=4 -> (st_n'=3) & (hlock'=false);

endmodule

module H_Speech

	st_o: [0..1];
	[h_speak] st_o=1 -> (st_o'=0);
	[h_donespeak] st_o=0 -> (st_o'=1);

endmodule

module R_Speech

	st_p: [0..1];
	[speak] st_p=1 -> (st_p'=0);
	[stopSpeaking] st_p=0 -> (st_p'=1);

endmodule

