mdp

global spoke: bool;
global ended: bool;
global hSpeakLock: bool;
global look_at_people: bool;
global allow_speech: bool;

init
	spoke=false &
	ended=false &
	hSpeakLock=false &
	look_at_people=false &
	allow_speech=true &
	st_m=0 &
	(st_n=0 | st_n=1 | st_n=2) &
	st_o=0 &
	st_p=0
endinit
module Robot

	st_m: [0..1];
	[h_donespeak] st_m=0 & allow_speech=true -> (st_m'=1) & (ended'=true);
	[endFaceTracker] st_m=0 & spoke=false & hSpeakLock=false -> (st_m'=1) & (ended'=true);

endmodule

module Human

	st_n: [0..3];
	[h_speak] st_n=0 & spoke=false & ended=false & allow_speech=true -> (st_n'=3);
	[h_speak] st_n=1 & ended=false & allow_speech=true -> (st_n'=3);
	[h_speak] st_n=2 & ended=false & allow_speech=true -> (st_n'=3);
	[h_donespeak] st_n=3 -> (st_n'=0);
	[ignoredFoundFace] st_n=2 -> (st_n'=1);
	[ignoredLostAttention] st_n=1 -> (st_n'=2);
	[busyReadyFoundFace] st_n=0 -> (st_n'=0);
	[busyReadyFoundFace] st_n=1 -> (st_n'=1);
	[readyLostFace] st_n=0 -> (st_n'=0);

endmodule

module H_Speech

	st_o: [0..1];
	[h_speak] st_o=0 -> (st_o'=1) & (hSpeakLock'=true);
	[h_donespeak] st_o=1 -> (st_o'=0) & (spoke'=true) & (hSpeakLock'=false);

endmodule

module R_Gaze

	st_p: [0..2];
	[] st_p=0 & look_at_people=true & ended=false -> (st_p'=1);
	[ignoredFoundFace] st_p=1 & ended=false -> (st_p'=2);
	[ignoredLostAttention] st_p=2 & ended=false -> (st_p'=1);
	[busyReadyFoundFace] st_p=1 & ended=false -> (st_p'=2);
	[readyLostFace] st_p=2 & ended=false -> (st_p'=1);
	[h_donespeak] st_p=1 -> (st_p'=0);
	[h_donespeak] st_p=2 -> (st_p'=0);
	[h_donespeak] st_p=0 -> (st_p'=0);
	[endFaceTracker] st_p=1 -> (st_p'=0);
	[endFaceTracker] st_p=2 -> (st_p'=0);
	[endFaceTracker] st_p=0 -> (st_p'=0);

endmodule

