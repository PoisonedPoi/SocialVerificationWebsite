//==============================================================================
//	
//	Copyright (c) 2002-
//	Authors:
//	* Dave Parker <david.parker@comlab.ox.ac.uk> (University of Oxford, formerly University of Birmingham)
//	
//------------------------------------------------------------------------------
//	
//	This file is part of PRISM.
//	
//	PRISM is free software; you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation; either version 2 of the License, or
//	(at your option) any later version.
//	
//	PRISM is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//	
//	You should have received a copy of the GNU General Public License
//	along with PRISM; if not, write to the Free Software Foundation,
//	Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
//	
//==============================================================================

// includes
#include "PrismMTBDD.h"
#include <math.h>
#include <util.h>
#include <cudd.h>
#include <dd.h>
#include <odd.h>
#include "PrismMTBDDGlob.h"
#include "jnipointer.h"
#include "prism.h"

//------------------------------------------------------------------------------

JNIEXPORT jlong __jlongpointer JNICALL Java_mtbdd_PrismMTBDD_PM_1ProbCumulReward
(
JNIEnv *env,
jclass cls,
jlong __jlongpointer t,		// trans matrix
jlong __jlongpointer sr,		// state rewards
jlong __jlongpointer trr,	// transition rewards
jlong __jlongpointer od,		// odd
jlong __jlongpointer rv,		// row vars
jint num_rvars,
jlong __jlongpointer cv,		// col vars
jint num_cvars,
jint bound				// time bound
)
{
	// cast function parameters
	DdNode *trans = jlong_to_DdNode(t);		// trans matrix
	DdNode *state_rewards = jlong_to_DdNode(sr);	// state rewards
	DdNode *trans_rewards = jlong_to_DdNode(trr);	// transition rewards
	ODDNode *odd = jlong_to_ODDNode(od);		// odd
	DdNode **rvars = jlong_to_DdNode_array(rv);	// row vars
	DdNode **cvars = jlong_to_DdNode_array(cv);	// col vars

	// mtbdds
	DdNode *all_rewards, *sol, *tmp;
	// timing stuff
	long start1, start2, start3, stop;
	double time_taken, time_for_setup, time_for_iters;
	// misc
	int iters;

	// start clocks	
	start1 = start2 = util_cpu_time();

	// multiply transition rewards by transition probs and sum rows
	// then combine state and transition rewards and put in a vector
	Cudd_Ref(trans_rewards);
	Cudd_Ref(trans);
	all_rewards = DD_Apply(ddman, APPLY_TIMES, trans_rewards, trans);
	all_rewards = DD_SumAbstract(ddman, all_rewards, cvars, num_cvars);
	Cudd_Ref(state_rewards);
	all_rewards = DD_Apply(ddman, APPLY_PLUS, state_rewards, all_rewards);

	// initial solution is zero
	sol = DD_Constant(ddman, 0);

	// get setup time
	stop = util_cpu_time();
	time_for_setup = (double)(stop - start2)/1000;
	start2 = stop;
	start3 = stop;

	// start iterations
	PM_PrintToMainLog(env, "\nStarting iterations...\n");

	// note that we ignore max_iters as we know how any iterations _should_ be performed
	for (iters = 0; iters < bound; iters++) {
	
		// matrix-vector multiply
		Cudd_Ref(sol);
		tmp = DD_PermuteVariables(ddman, sol, rvars, cvars, num_rvars);
		Cudd_Ref(trans);
		tmp = DD_MatrixMultiply(ddman, trans, tmp, cvars, num_cvars, MM_BOULDER);
		// add in (combined state and transition) rewards
		Cudd_Ref(all_rewards);
		tmp = DD_Apply(ddman, APPLY_PLUS, tmp, all_rewards);
		
		// print occasional status update
		if ((util_cpu_time() - start3) > UPDATE_DELAY) {
			PM_PrintToMainLog(env, "Iteration %d (of %d): ", iters, bound);
			PM_PrintToMainLog(env, "%.2f sec so far\n", ((double)(util_cpu_time() - start2)/1000));
			start3 = util_cpu_time();
		}
		
		// prepare for next iteration
		Cudd_RecursiveDeref(ddman, sol);
		sol = tmp;
	}
	
	// stop clocks
	stop = util_cpu_time();
	time_for_iters = (double)(stop - start2)/1000;
	time_taken = (double)(stop - start1)/1000;
	
	// print iterations/timing info
	PM_PrintToMainLog(env, "\nIterative method: %d iterations in %.2f seconds (average %.6f, setup %.2f)\n", iters, time_taken, time_for_iters/iters, time_for_setup);
	
	// free memory
	Cudd_RecursiveDeref(ddman, all_rewards);
	
	return ptr_to_jlong(sol);
}

//------------------------------------------------------------------------------
