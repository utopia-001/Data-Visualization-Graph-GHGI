import { useEffect, useState } from "react";
import dynamic from "next/dynamic.js";
import { exportToCSV } from "../utils/exportCSV";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import ModalComponent from "./modal_component";

const utils = require("../utils/utils");
const dataSrc = require("../consts/221201_HomePage.json");
const consts = require("../consts/consts");

const FC = dynamic(() => import("./fusion_chart.js"), { ssr: false });

const HomeComponent = ({ country }) => {
    const [AFOLUData, setAFOLUData] = useState([]);
    const [exportData, setExportData] = useState([]);
    const [height1, setHeight1] = useState(120);
    const [height2, setHeight2] = useState(150);
    const [gwp, setGWP] = useState(consts.AR_5);

    const [dataSource, setDataSource] = useState(consts.DATA_SOURCE_UNFCCC);
    const [year, setYear] = useState(1994);
    const [yearList, setYearList] = useState([]);
    const [gwpList, setGwpList] = useState([]);
    const [dataSourceList, setDataSourceList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGWPModalOpen, setIsGWPModalOpen] = useState(false);

    const [chartConfigs, setChartConfigs] = useState({
        type: "doughnut2d",
        width: "99%",
        height: "100%",
        dataFormat: "JSON",
        containerBackgroundOpacity: "0",
        dataSource: {
            chart: {
                caption: "",
                captionFontColor: "#113458",
                captionFontSize: "20",
                captionFontBold: "0",
                subCaptionFontColor: "#113458",
                subCaptionFontSize: "16",
                loadMessageColor: "#ff0000",
                divLineColor: "#113458",
                chartTopMargin: "30",
                bgColor: "#000000",
                bgAlpha: "0",
                labelFontSize: "12",
                labelFontColor: "#113458",
                smartLineColor: "#113458",
                legendItemFontColor: "#113458",
                labelDistance: 10,
                legendCaptionFontColor: "#ff0000",
                defaultcenterlabel: "",
                defaultcenterlabelColor: "#113458",
                tooltipBorderRadius: "10",
                skipOverlapLabels: "1",
                label: "",
                plottooltext: "<b>$value</b> Mt CO2e from the <b>$label</b> sector",
                link: "#ff0000",
                showLegend: "0",
                startingAngle: "30",
                enableSlicing: "0",
                decimals: "1",
                theme: "fusion"
            },
            data: []
        }
    });

    useEffect(() => {
    });

    useEffect(() => {
        filterData();
    }, [dataSource, year, gwp, country]);
    const filterData = () => {
        // get year list
        let yearArr = [];
        yearArr = dataSrc.map((ele) => {
            return ele["Year"];
        }).reduce(
            (arr, item) => (arr.includes(item) ? arr : [...arr, item]),
            [],
        );
        setYearList(yearArr);

        // get gwp list
        let gwpArr = [];
        gwpArr = dataSrc.map((ele) => {
            return ele["AR"];
        }).reduce(
            (arr, item) => (arr.includes(item) ? arr : [...arr, item]), [],
        );
        setGwpList(gwpArr);

        // get dataSource list
        let dataSourceArr = [];
        dataSourceArr = dataSrc.map((ele) => {
            return ele["DataSource"];
        }).reduce(
            (arr, item) => (arr.includes(item) ? arr : [...arr, item]),
            [],
        );
        setDataSourceList(dataSourceArr);

        let data = dataSrc.filter((ele) => {
            return (ele["Party"] === country && parseInt(ele["Year"]) === parseInt(year) && ele["AR"] === gwp);
        });
        setExportData(data);

        let afoluData = data.filter((ele) => {
            return (ele["Category"] === consts.CATEGORY_AFOLU && ele["DataSource"] === dataSource);
        })
        setAFOLUData(afoluData);

        let set = new Set();
        let arr = [];
        let i = 0;
        let subCaptionStr = "No Data to Display";
        data.forEach((item) => {
            let tmpItem = new Object();
            tmpItem["label"] = item["Category"];
            tmpItem["value"] = parseFloat(item["EmissionCategoryMtCO2e"]);
            tmpItem["percentValue"] = (parseFloat(item["EmissionCategoryMtCO2e"]) / parseFloat(item["TotalEmissionsMtCO2e"]) * 100).toFixed(2);
            tmpItem["color"] = item["HEX_Donut"];
            if (!set.has(item["Category"])) {
                set.add(item["Category"]);
                arr.push(tmpItem);
            }
            i++;
        })
        let captionStr = `<b>${country}'s Total GHG emissions in ${year}</b>{br}`;
        if (data.length > 0) {

            captionStr += data[0]["TotalEmissionsMtCO2e"] + ` Mt CO2e`;
            subCaptionStr = "{br}" + data[0]["TotalEmissionsCapitatCO2e_cap"] + " t CO2e/cap";
        }
        setChartConfigs({
            ...chartConfigs, dataSource: {
                ...chartConfigs.dataSource,
                data: arr,
                chart: { ...chartConfigs.dataSource.chart, caption: captionStr, subCaption: subCaptionStr }
            }
        });
    }

    useEffect(() => {
        if (AFOLUData.length) {
            setHeight2(height1 / parseFloat(AFOLUData[0]["TotalAFOLUEmissionsMtCO2e"]) *
                Math.abs(parseFloat(AFOLUData[0]["TotalAFOLURemovalsMtCO2e"])));
        }
    }, [AFOLUData]);

    const openModal = () => {
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
    }

    const openGWPModal = () => {
        setIsGWPModalOpen(true);
    }

    const closeGWPModal = () => {
        setIsGWPModalOpen(false);
    }


    const dataSourceChange = (e) => {
        setDataSource(e.target.value);
    }

    const yearChange = (e) => {
        setYear(e.target.value);
    }

    const gwpChange = (e) => {
        setGWP(e.target.value);
    }

    const downloadData = () => {
        let fileName = new Date();
        fileName = fileName.getFullYear() + "-" + (fileName.getMonth() + 1) + "-" + fileName.getDate() + " " +
            fileName.getHours() + ":" + fileName.getMinutes() + ":" + fileName.getSeconds();
        exportToCSV(exportData, fileName);
    }

    const gwpModalContent = <><div className="mt-5 text-[#113458]">GWP Modal Content</div></>
    const modalContent = <>
        <div className="mt-5 text-[#113458]">
            <b>Country :</b> {country}<br />
            <b>Year :</b> {year}<br />
            <b>GWP :</b> {gwp}<br />
        </div>
    </>

    return (
        <>
            <div className="py-2 px-8">
                <div className="bg-[#113458] bg-opacity-10 rounded-xl py-3 px-3 sm:px-5 grid items-center" >
                    <div className="mb-5">
                        <label htmlFor="countries" className="hidden md:block text-lg font-medium text-[#113458]">
                            Overview of total greenhouse gas emissions and role of AFOLU
                        </label>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex">
                            <div className="flex items-center mr-2.5">
                                <label htmlFor="countries" className="text-sm font-medium text-[#113458] mr-2.5">Year : </label>
                                <select id="countries" className="bg-[#113458] bg-opacity-10 border border-[#113458] text-[#113458] text-xs sm:text-sm rounded-lg focus:text-[#113458] focus:border-[#113458] focus-visible:outline-none block p-1.5" value={year} onChange={yearChange}>
                                    {
                                        yearList.map((item, idx) => (
                                            <option className="text-[#113458]" key={"year_option" + idx} value={item}>{item}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="flex items-center mx-2.5">
                                <button
                                    type="button"
                                    onClick={openGWPModal}
                                    className="text-[#113458] hover:text-white focus:bg-gray-300 font-medium rounded-lg text-xs sm:text-sm px-1.5 py-1.5 text-center mr-2"
                                >
                                    <span className="">
                                        <InformationCircleIcon
                                            className="h-5 w-5 text-[#113458] hover:text-white"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </button>

                                <ModalComponent title={consts.MODAL_TITLE_GWP} content={gwpModalContent} isModalOpen={isGWPModalOpen} closeModal={closeGWPModal} />
                                <label htmlFor="countries" className="text-sm font-medium text-[#113458] mr-2.5">GWP : </label>
                                <select id="countries" className="bg-[#113458] bg-opacity-10 border border-[#113458] text-[#113458] text-xs sm:text-sm rounded-lg focus:text-[#113458] focus:border-[#113458] focus-visible:outline-none block p-1.5" value={gwp} onChange={gwpChange}>
                                    {
                                        gwpList.map((arItem, idx) => (
                                            <option className="text-[#113458]" key={"ar_option" + idx} value={arItem}>{arItem}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="items-center mx-2.5 hidden lg:flex">
                                <label htmlFor="countries" className="text-sm font-medium text-[#113458] mr-2.5">Data Source : </label>
                                <select id="countries" className="bg-[#113458] bg-opacity-10 border border-[#113458] text-[#113458] text-xs sm:text-sm rounded-lg focus:text-[#113458] focus:border-[#113458] focus-visible:outline-none block p-1.5" value={dataSource} onChange={dataSourceChange}>
                                    {
                                        dataSourceList.map((dataSrcItem, idx) => (
                                            <option className="text-[#113458]" key={"dataSrc_option" + idx} value={dataSrcItem}>{dataSrcItem}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={openModal}
                                    className="text-[#113458] hover:text-white focus:bg-gray-300 font-medium rounded-lg text-xs sm:text-sm px-1.5 py-1.5 text-center mr-2"
                                >
                                    <span className="">
                                        <InformationCircleIcon
                                            className="h-5 w-5 text-[#113458] hover:text-white"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </button>

                                <ModalComponent title={consts.MODAL_TITLE_OVERVIEW} content={modalContent} isModalOpen={isModalOpen} closeModal={closeModal} />

                                <button type="button" className="text-[#113458] bg-[#f4cc13] hover:text-white focus:ring-4 focus:ring-yellow-200 font-medium rounded-lg text-xs sm:text-sm px-4 py-1.5 text-center" onClick={downloadData}>
                                    <span className="hidden xl:block">Download Data</span>
                                    <span className="xl:hidden">
                                        <ArrowDownTrayIcon
                                            className="h-5 w-5 text-[#113458] hover:text-white"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-12" style={{ minHeight: "400px" }}>
                        <div className="grid col-span-12 lg:col-span-4 bg-gradient-to-b lg:bg-gradient-to-r from-[#11345822] rounded-md text-[#113458] leading-loose p-3 my-3">
                            {exportData.length ? 
                            <div>{exportData[0]["TextParagraph1"]}<br/><br/>{exportData[0]["TextParagraph2"]}</div> : 
                            <span className="text-[#11345822]"><i>No Data to Display</i></span>}
                        </div>
                        <div className="hidden md:block lg:hidden col-span-12 justify-self-end">
                            <div className="items-center flex">
                                <label htmlFor="countries" className="hidden md:block text-sm font-medium text-[#113458] mr-2.5">Data Source : </label>
                                <select id="countries" className="bg-[#113458] bg-opacity-10 border border-[#113458] text-[#113458] text-xs sm:text-sm rounded-lg focus:text-[#113458] focus:border-[#113458] focus-visible:outline-none block p-1.5" value={dataSource} onChange={dataSourceChange}>
                                    {
                                        consts.DATA_SOURCE_LIST.map((dataSrcItem, idx) => (
                                            <option className="text-[#113458]" key={"dataSrc_option" + idx} value={dataSrcItem}>{dataSrcItem}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="grid col-span-12 md:col-span-6 lg:col-span-5 md:mr-3 my-3" style={{ minHeight: "400px" }}>
                            {/* <div className="grid col-span-12 md:col-span-6 lg:col-span-5 md:mr-3 bg-gradient-to-t md:bg-gradient-to-r lg:bg-gradient-to-b lg:mx-3 from-[#11345822] rounded-md my-3" style={{ minHeight: "400px" }}> */}
                            {exportData.length ? <FC chartConfigs={chartConfigs}></FC> :
                                <>
                                    <div className="text-[#113458] grid text-center items-center p-3 my-3">
                                        <b>No Data to Display!</b>
                                    </div>
                                </>
                            }
                        </div>
                        <div className="md:hidden col-span-12 justify-self-end">
                            <div className="items-center flex">
                                <label htmlFor="countries" className="text-sm font-medium text-[#113458] mr-2.5">Data Source : </label>
                                <select id="countries" className="bg-[#113458] bg-opacity-10 border border-[#113458] text-[#113458] text-xs sm:text-sm rounded-lg focus:text-[#113458] focus:border-[#113458] focus-visible:outline-none block p-1.5" value={dataSource} onChange={dataSourceChange}>
                                    {
                                        consts.DATA_SOURCE_LIST.map((dataSrcItem, idx) => (
                                            <option className="text-[#113458]" key={"dataSrc_option" + idx} value={dataSrcItem}>{dataSrcItem}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 grid grid-cols-2 bg-gradient-to-b md:bg-gradient-to-l from-[#11345822] rounded-md text-[#113458] text-center p-3 my-3">
                            {AFOLUData.length ?
                                <>
                                    {AFOLUData[0]["TotalAFOLUEmissionsMtCO2e"] > 0 ?
                                        <>
                                            <div className="text-xl mt-3 col-span-2 font-normal">
                                                <b><span className="text-lg">AFOLU Sector</span></b>
                                            </div>
                                            <div className="text-md col-span-2 font-normal">
                                                <span>Total Net: {AFOLUData[0]["TotalNetAFOLUMtCO2e"]} Mt CO2e</span>
                                            </div>

                                            {/* AFOLU Emissions Section */}
                                            <div className="px-3 col-span-2 xs:col-span-1" style={{ minHeight: "200px" }}>
                                                <div className="text-sm my-3"><b>AFOLU Emissions</b></div>
                                                <div className="text-xs mb-3 text-[#113458]"><b>
                                                    {AFOLUData[0]["TotalAFOLUEmissionsMtCO2e"]} Mt CO2e
                                                </b></div>
                                                <div className="w-auto" style={{ height: `${height1}px` }}>
                                                    {
                                                        AFOLUData.map((item, idx) => (
                                                            <span key={"SourceOfEmissions" + idx}>
                                                                {(parseFloat(item["AFOLUEmissionsMtCO2e"]) > 0) ?
                                                                    <div className="grid items-center relative" style={{ height: `${parseFloat(item["AFOLUEmissionsMtCO2e"]) / parseFloat(item["TotalAFOLUEmissionsMtCO2e"]) * 100}%`, backgroundColor: `${item["HEX"]}` }}>
                                                                        {(height1 * parseFloat(item["AFOLUEmissionsMtCO2e"]) / parseFloat(item["TotalAFOLUEmissionsMtCO2e"])).toFixed(2) > 20 ? <span className="text-[#113458]">{parseFloat(item["AFOLUEmissionsMtCO2e"])}</span> : ""}
                                                                    </div>
                                                                    : ""
                                                                }
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            </div>

                                            {/* AFOLU Removals Section */}
                                            <div className="px-3 col-span-2 xs:col-span-1" style={{ minHeight: "200px" }}>
                                                {AFOLUData[0]["TotalAFOLURemovalsMtCO2e"] != 0 ?
                                                    <>
                                                        <div className="text-sm my-3"><b>AFOLU Removals</b></div>
                                                        <div className="text-xs mb-3 text-[#113458]"><b>
                                                            {AFOLUData[0]["TotalAFOLURemovalsMtCO2e"]} Mt CO2e
                                                        </b></div>
                                                        <div className="w-full" style={{ height: `${height2}px` }}>
                                                            {
                                                                AFOLUData.map((item, idx) => (
                                                                    <span key={"SinksForRemovals" + idx}>
                                                                        {(parseFloat(Math.abs(item["AFOLURemovalsMtCO2e"])) > 0) ?
                                                                            <div className="grid items-center relative" style={{ height: `${parseFloat(item["TotalAFOLURemovalsMtCO2e"]) ? Math.abs(parseFloat(item["AFOLURemovalsMtCO2e"]) / parseFloat(item["TotalAFOLURemovalsMtCO2e"]) * 100) : 0}%`, backgroundColor: `${item["HEX"]}` }}>
                                                                                {Math.abs((height2 * parseFloat(item["AFOLURemovalsMtCO2e"]) / parseFloat(item["TotalAFOLURemovalsMtCO2e"])).toFixed(2)) > 20 ? <span className="text-[#113458]">{item["AFOLURemovalsMtCO2e"]}</span> : ""}
                                                                            </div>
                                                                            : ""
                                                                        }
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                        <div className="w-full bg-opacity-10" style={{ backgroundImage: "url(../)", height: `${height1 - height2}px` }}></div>
                                                    </> :
                                                    ""
                                                }
                                            </div>

                                            {/* Legend for AFOLU Emissions */}
                                            <div className="text-left my-3 px-3">
                                                {
                                                    AFOLUData.map((item, idx) => (
                                                        <div key={"right_" + idx}>
                                                            {(parseFloat(item["AFOLUEmissionsMtCO2e"]) > 0) ?
                                                                <div key={"right1" + idx} className="flex mt-2 items-center">
                                                                    <div className="rounded-lg" style={{ minWidth: "15px", width: "15px", height: "15px", backgroundColor: `${item["HEX"]}` }}>
                                                                    </div>
                                                                    <p className="text-xs pl-2">{item["SubCategory"]}</p>
                                                                </div>
                                                                : ""
                                                            }
                                                        </div>
                                                    ))
                                                }
                                            </div>

                                            {/* Legend for AFOLU Removals */}
                                            {AFOLUData[0]["TotalAFOLURemovalsMtCO2e"] != 0 ?
                                                <>
                                                    <div className="text-left my-3 px-3">
                                                        {
                                                            AFOLUData.map((item, idx) => (
                                                                <div key={"left" + idx}>
                                                                    {(parseFloat(item["AFOLURemovalsMtCO2e"]) != 0) ?
                                                                        <div className="flex mt-2 items-center">
                                                                            <div className="rounded-lg" style={{ minWidth: "15px", width: "15px", height: "15px", backgroundColor: `${item["HEX"]}` }}>
                                                                            </div>
                                                                            <p className="text-xs pl-2">{item["SubCategory"]}</p>
                                                                        </div>
                                                                        : ""
                                                                    }
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </> :
                                                ""
                                            }
                                        </> :
                                        <>
                                            <div className="text-lg mt-3 pl-3 col-span-2 font-normal"><b>No AFOLU Data</b></div>
                                        </>
                                    }
                                </>
                                :
                                <>
                                    <div className="text-[#113458] grid text-center items-center col-span-2 p-3 my-3">
                                        <b>No Data to Display!</b>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomeComponent;