mdp

global Speechrobot: bool;
global Speechhuman: bool;

init
	Speechrobot=false &
	Speechhuman=false &
	st_m=0
endinit
module Ask

	st_m: [0..8];
	[] st_m=0 & Speechrobot=false -> (st_m'=1) & (Speechrobot'=true);
	[] st_m=1 -> (st_m'=7) & (Speechrobot'=false);
	[] st_m=2 -> (st_m'=5) & (Speechhuman'=false);
	[] st_m=2 -> (st_m'=4) & (Speechhuman'=false);
	[] st_m=3 -> (st_m'=7) & (Speechrobot'=false);
	[] st_m=4 & Speechrobot=false -> (st_m'=3) & (Speechrobot'=true);
	[] st_m=5 -> (st_m'=6);
	[] st_m=6 -> (st_m'=6);
	[] st_m=7 & Speechhuman=false -> (st_m'=2) & (Speechhuman'=true);
	[] st_m=7 -> (st_m'=8);
	[] st_m=8 -> (st_m'=8);

endmodule

