/** ******************************************************************************************************************
 * @file Describe what performance does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 14-Mar-2018
 *********************************************************************************************************************/
"use strict";

import chalk from "chalk";

let enabled       = false,
    profilerStart = 0,
    counts,
    marks,
    measures;

const
    // eslint-disable-next-line no-eval
    _g             = ( 1, eval )( 'this' ),
    hrTime         = process && typeof process.hrtime === 'function' && ( () => {
        const [ secs, nanos ] = process.hrtime();
        return ( secs * 1e9 + nanos ) / 1e3;
    } ),
    perf           = !hrTime && _g.performace && typeof _g.performance.now === 'function' && ( () => _g.performance.now() * 1e3 ),
    dnow           = !perf && Date && typeof Date.now === 'function' && ( () => Date.now() * 1e6 ),
    timestamp      = hrTime || perf || dnow,
    profilerEvents = [],
    getMemoryUsage = () => _g.gc ? _g.gc() : process.memoryUsage().heapUsed,
    padLeft        = ( s, n ) => s.padStart( n ),
    padRight       = ( s, n ) => s.padEnd( n ),
    {
        red,
        yellow,
        greenBright: green,
        whiteBright: white,
        cyanBright: cyan,
        gray
    }              = chalk;


export const performance = {

    set onProfilerEvent( fn )
    {
        profilerEvents.push( fn );
    },

    emit( name )
    {
        profilerEvents.forEach( fn => fn( name ) );
    },

    /**
     * Marks a performance event.
     *
     * @param markName The name of the mark.
     */
    mark( markName )
    {
        if ( enabled )
        {
            marks.set( markName, timestamp() );
            counts.set( markName, ( counts.get( markName ) || 0 ) + 1 );
            profilerEvents.forEach( fn => fn( markName ) );
        }
    },

    /**
     * Adds a performance measurement with the specified name.
     *
     * @param measureName The name of the performance measurement.
     * @param [startMarkName] The name of the starting mark. If not supplied, the point at which the
     *      profiler was enabled is used.
     * @param [endMarkName] The name of the ending mark. If not supplied, the current timestamp is
     *      used.
     */
    measure( measureName, startMarkName, endMarkName )
    {
        if ( !enabled ) return;

        const
            end   = endMarkName && marks.get( endMarkName ) || timestamp(),
            start = startMarkName && marks.get( startMarkName ) || profilerStart;

        measures.set( measureName, ( measures.get( measureName ) || 0 ) + ( end - start ) );
    },

    /**
     * Gets the number of times a marker was encountered.
     *
     * @param markName The name of the mark.
     */
    getCount( markName )
    {
        return counts && counts.get( markName ) || 0;
    },

    /**
     * Gets the total duration of all measurements with the supplied name.
     *
     * @param measureName The name of the measure whose durations should be accumulated.
     */
    getDuration( measureName )
    {
        return measures && measures.get( measureName ) || 0;
    },

    /**
     * Iterate over each measure, performing some action
     *
     * @param cb The action to perform for each measure
     */
    forEachMeasure( cb )
    {
        measures.forEach( ( measure, key ) => cb( key, measure ) );
    },

    /** Enables (and resets) performance measurements for the compiler. */
    enable()
    {
        counts        = new Map();
        marks         = new Map();
        measures      = new Map();
        enabled       = true;
        profilerStart = timestamp();
    },

    /** Disables performance measurements for the compiler. */
    disable()
    {
        enabled = false;
    }
};

// /**
//  * @param compilerOptions
//  */
// export function enableStatistics( compilerOptions )
// {
//     if ( compilerOptions.diagnostics || compilerOptions.extendedDiagnostics )
//         performance.enable();
// }

/**
 * @param {Program} program
 * @param {boolean} [extendedDiagnostics=false]
 */
export function reportStatistics( program, extendedDiagnostics = false )
{
    /** @type {{ name: string, value: string}[]} */
    let statistics;

    // const compilerOptions = program.getCompilerOptions();

    // if ( compilerOptions.diagnostics || compilerOptions.extendedDiagnostics )
    // {
    statistics = [];

    const memoryUsed = getMemoryUsage();

    reportCountStatistic( "Files", program.getSourceFiles().length );
    reportCountStatistic( "Lines", program.numLines );
    reportCountStatistic( "Nodes", program.getNodeCount() );
    reportCountStatistic( "Identifiers", program.getIdentifierCount() );
    reportCountStatistic( "Symbols", program.getSymbolCount() );
    reportCountStatistic( "Types", program.getTypeCount() );

    if ( memoryUsed >= 0 )
    {
        reportBlankLine();
        reportStatisticalValue( "Memory used", Math.round( memoryUsed / 1000 ) + "K" );
        reportBlankLine();
    }

    const
        programTime = performance.getDuration( "Program" ),
        bindTime    = performance.getDuration( "Bind" ),
        checkTime   = performance.getDuration( "Check" ),
        emitTime    = performance.getDuration( "Emit" );

    if ( extendedDiagnostics )
        performance.forEachMeasure( ( name, duration ) => reportTimeStatistic( `${name} time`, duration ) );
    else
    {
        // Individual component times.
        // Note: To match the behavior of previous versions of the compiler, the reported parse time includes
        // I/O read time and processing time for triple-slash references and module imports, and the reported
        // emit time includes I/O write time. We preserve this behavior so we can accurately compare times.
        reportTimeStatistic( "I/O read", performance.getDuration( "I/O Read" ) );
        reportTimeStatistic( "I/O write", performance.getDuration( "I/O Write" ) );
        reportTimeStatistic( "Parse time", programTime );
        reportTimeStatistic( "Bind time", bindTime );
        reportTimeStatistic( "Check time", checkTime );
        reportTimeStatistic( "Emit time", emitTime );
    }

    reportTimeStatistic( "Total time", programTime + bindTime + checkTime + emitTime );
    reportStatistics();

    performance.disable();

    // }

    /**
     *
     */
    function reportStatistics()
    {
        let nameSize  = 0;
        let valueSize = 0;

        for ( const { name, value } of statistics )
        {
            if ( name.length > nameSize )
                nameSize = name.length;

            if ( value.length > valueSize )
                valueSize = value.length;
        }

        console.log( white( `\n--------------------------------------------------------------------------------------------------------\n Statistics
--------------------------------------------------------------------------------------------------------\n` ) );

        for ( const { name, value } of statistics )
        {
            const clr = ns => ns.replace( /^(.*)([^\d]*)$/, ( $0, $1, $2 ) => green( $1 ) + ( $2 ? cyan( $2 ) : '' ) );

            console.log( cyan( padRight( name + ( name ? ":" : "" ), nameSize + 4 ) ) + clr( padLeft( value.toString(), valueSize ) ) );
        }

        console.log();
    }

    /**
     * @param {string} name
     * @param {number} value
     */
    function reportStatisticalValue( name, value )
    {
        statistics.push( {
            name,
            value
        } );
    }

    /**
     * @param {string} name
     * @param {number} count
     */
    function reportCountStatistic( name, count )
    {
        reportStatisticalValue( name, "" + count );
    }

    /**
     * @param {string} name
     * @param {number} time
     */
    function reportTimeStatistic( name, time )
    {
        reportStatisticalValue( name, ( time / 1000 ).toFixed( 2 ) + " μs" );
    }

    /**
     *
     */
    function reportBlankLine()
    {
        statistics.push( {
            name:  '',
            value: ''
        } );
    }
}
