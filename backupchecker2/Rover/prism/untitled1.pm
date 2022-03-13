mdp

global Speechhuman: bool;
global Speechrobot: bool;

init
	Speechhuman=false &
	Speechrobot=false &
	(st_m=0 | st_m=1)
endinit
module Remark

	st_m: [0..5];
	[] st_m=0 & Speechrobot=false -> (st_m'=2) & (Speechrobot'=true);
	[] st_m=1 & Speechrobot=false -> (st_m'=3) & (Speechrobot'=true);
	[] st_m=2 -> (st_m'=4) & (Speechrobot'=false);
	[] st_m=3 -> (st_m'=5) & (Speechrobot'=false);
	[] st_m=4 -> (st_m'=4);
	[] st_m=5 -> (st_m'=5);

endmodule

